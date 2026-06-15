from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User, AccessStatus
from app.schemas.login import ForgotPasswordRequest, ForgotPasswordResponse, UserLogin, Token
from app.utils.security import hash_password, verify_password
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from app.utils.autho import create_access_token

router = APIRouter(prefix="/users", tags=["Login"])


# --- Login Router ---
@router.post("/login", response_model=Token)
def login_user(
    user_credentials: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    email = user_credentials.username.strip().lower()
    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    if not verify_password(user_credentials.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    if user.access_status == AccessStatus.pending:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is pending admin approval. Please wait until an administrator activates it.",
        )

    if user.access_status == AccessStatus.suspended:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is suspended. Please contact an administrator.",
        )

    access_token = create_access_token(data={"user_id": user.id})
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
def forgot_password(
    payload: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    email = payload.email.strip().lower()
    mobile = payload.mobile.strip()

    if payload.new_password != payload.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password and confirm password do not match.",
        )

    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account was found for that email address.",
        )

    if (user.mobile or "").strip() != mobile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The mobile number does not match this account.",
        )

    if verify_password(payload.new_password, user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please choose a new password that is different from your current password.",
        )

    user.password = hash_password(payload.new_password)
    db.commit()

    return {
        "message": "Your password has been updated successfully. Please log in with your new password.",
    }
