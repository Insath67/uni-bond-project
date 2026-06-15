from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User, AccessStatus
from app.schemas.user import UserResponse
from app.utils.autho import get_current_user
from typing import List

router = APIRouter(prefix="/admin", tags=["Admin"])


def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


# --- Get all pending users ---
@router.get("/pending-users", response_model=List[UserResponse])
def get_pending_users(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    return db.query(User).filter(User.access_status == AccessStatus.pending).all()


# --- Approve a user ---
@router.put("/users/{user_id}/approve", response_model=UserResponse)
def approve_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.access_status = AccessStatus.active
    db.commit()
    db.refresh(user)
    return user


# --- Suspend a user ---
@router.put("/users/{user_id}/suspend", response_model=UserResponse)
def suspend_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.access_status = AccessStatus.suspended
    db.commit()
    db.refresh(user)
    return user


# --- Re-activate a suspended user ---
@router.put("/users/{user_id}/activate", response_model=UserResponse)
def activate_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.access_status = AccessStatus.active
    db.commit()
    db.refresh(user)
    return user


# --- Get pending count (for dashboard) ---
@router.get("/stats")
def get_admin_stats(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    total = db.query(User).count()
    pending = db.query(User).filter(User.access_status == AccessStatus.pending).count()
    active = db.query(User).filter(User.access_status == AccessStatus.active).count()
    suspended = db.query(User).filter(User.access_status == AccessStatus.suspended).count()
    return {
        "total_users": total,
        "pending_users": pending,
        "active_users": active,
        "suspended_users": suspended,
    }
