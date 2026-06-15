from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_, select
from sqlalchemy import or_, cast, String
from sqlalchemy.exc import ProgrammingError
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import undefer
from app.db.database import get_db
from app.models.user import User, UserRole, AccessStatus
from app.models.user_follow import UserFollow
from app.schemas.user import (
    UserCreate,
    UserResponse,
    UserUpdate,
    UserStatusUpdate,
    UserDiscoverResponse,
    FollowStatusResponse,
    UserSummaryResponse,
    OnlineUserResponse,
    UserProfileResponse,
)
from app.utils.security import hash_password
from app.utils.autho import get_current_user
from typing import List
from datetime import datetime, timedelta, timezone
import os
import shutil
import uuid

router = APIRouter(prefix="/users", tags=["Users"])

UPLOAD_DIR = "uploads/cvs"
os.makedirs(UPLOAD_DIR, exist_ok=True)
AVATAR_UPLOAD_DIR = "uploads/avatars"
os.makedirs(AVATAR_UPLOAD_DIR, exist_ok=True)
COVER_UPLOAD_DIR = "uploads/covers"
os.makedirs(COVER_UPLOAD_DIR, exist_ok=True)

# --- Role code prefix & zero-pad helper ---
ROLE_PREFIX = {
    UserRole.student:   ("STD", 4),
    UserRole.lecturer:  ("LEC", 4),
    UserRole.company:   ("COM", 4),
    UserRole.tech_lead: ("TLE", 4),
    UserRole.admin:     ("AD",  2),
}


def parse_role_profile_fields(user: User) -> dict[str, str | None]:
    description = (user.description or "").strip()

    if user.role == UserRole.company:
        company_name = f"{user.first_name} {user.last_name}".strip()
        industry = None
        company_size = None

        if description:
            parts = [part.strip() for part in description.split("|")]
            if parts:
                company_name = parts[0] or company_name
            if len(parts) > 1:
                industry = parts[1] or None
            if len(parts) > 2:
                company_size = parts[2].replace("Size:", "").strip() or None

        return {
            "company_name": company_name or None,
            "industry": industry,
            "company_size": company_size,
            "industry_expertise": None,
            "years_of_experience": None,
        }

    if user.role == UserRole.tech_lead:
        industry_expertise = None
        years_of_experience = None

        if description:
            parts = [part.strip() for part in description.split("|")]
            if parts:
                industry_expertise = parts[0].replace("Expert in", "").strip() or None
            if len(parts) > 1:
                years_of_experience = parts[1].replace("years", "").strip() or None

        return {
            "company_name": None,
            "industry": None,
            "company_size": None,
            "industry_expertise": industry_expertise,
            "years_of_experience": years_of_experience,
        }

    return {
        "company_name": None,
        "industry": None,
        "company_size": None,
        "industry_expertise": None,
        "years_of_experience": None,
    }


def build_user_response(user: User) -> UserResponse:
    role_fields = parse_role_profile_fields(user)
    return UserResponse(
        id=user.id,
        user_code=user.user_code,
        first_name=user.first_name,
        last_name=user.last_name,
        username=user.username,
        email=user.email,
        role=user.role,
        description=user.description,
        education_status=user.education_status,
        city=user.city,
        country=user.country,
        school=user.school,
        mobile=user.mobile,
        cv_path=user.cv_path,
        avatar_path=user.avatar_path,
        cover_path=user.cover_path,
        access_status=user.access_status,
        created_at=user.created_at,
        **role_fields,
    )


def generate_user_code(role: UserRole, db: Session) -> str:
    prefix, pad = ROLE_PREFIX[role]
    count = db.query(User).filter(User.role == role).count()
    num = count + 1
    return f"{prefix}{str(num).zfill(pad)}"


def get_user_or_404(user_id: str, db: Session) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


def get_follow_counts(user_id: int, db: Session) -> tuple[int, int]:
    try:
        followers_count = db.query(UserFollow).filter(UserFollow.following_id == user_id).count()
        following_count = db.query(UserFollow).filter(UserFollow.follower_id == user_id).count()
        return followers_count, following_count
    except ProgrammingError as exc:
        db.rollback()
        if "user_follows" in str(exc).lower():
            return 0, 0
        raise


def is_following_user(follower_id: int, following_id: int, db: Session) -> bool:
    try:
        return (
            db.query(UserFollow)
            .filter(
                UserFollow.follower_id == follower_id,
                UserFollow.following_id == following_id,
            )
            .first()
            is not None
        )
    except ProgrammingError as exc:
        db.rollback()
        if "user_follows" in str(exc).lower():
            return False
        raise


def build_user_profile_response(profile_user: User, current_user: User, db: Session) -> UserProfileResponse:
    followers_count, following_count = get_follow_counts(profile_user.id, db)
    role_fields = parse_role_profile_fields(profile_user)
    return UserProfileResponse(
        id=profile_user.id,
        user_code=profile_user.user_code,
        first_name=profile_user.first_name,
        last_name=profile_user.last_name,
        username=profile_user.username,
        email=profile_user.email,
        role=profile_user.role,
        description=profile_user.description,
        education_status=profile_user.education_status,
        city=profile_user.city,
        country=profile_user.country,
        school=profile_user.school,
        mobile=profile_user.mobile,
        cv_path=profile_user.cv_path,
        avatar_path=profile_user.avatar_path,
        cover_path=profile_user.cover_path,
        **role_fields,
        access_status=profile_user.access_status,
        created_at=profile_user.created_at,
        followers_count=followers_count,
        following_count=following_count,
        is_following=is_following_user(current_user.id, profile_user.id, db) if profile_user.id != current_user.id else False,
        is_own_profile=profile_user.id == current_user.id,
    )


def build_user_discover_response(user: User, current_user: User, db: Session) -> UserDiscoverResponse:
    return UserDiscoverResponse(
        id=user.id,
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        role=user.role,
        city=user.city,
        country=user.country,
        avatar_path=user.avatar_path,
        is_following=is_following_user(current_user.id, user.id, db),
    )


def build_user_summary_response(user: User, current_user: User, db: Session) -> UserSummaryResponse:
    return UserSummaryResponse(
        id=user.id,
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        role=user.role,
        city=user.city,
        country=user.country,
        avatar_path=user.avatar_path,
        is_following=is_following_user(current_user.id, user.id, db),
    )


def is_user_online(user: User, now: datetime | None = None) -> bool:
    if not user.last_seen:
        return False
    current_time = now or datetime.now(timezone.utc)
    return user.last_seen >= current_time - timedelta(minutes=2)


def touch_user_presence(user: User, db: Session):
    now = datetime.now(timezone.utc)
    user_id = str(user.id)
    (
        db.query(User)
        .filter(cast(User.id, String) == user_id)
        .update({User.last_seen: now}, synchronize_session=False)
    )
    db.commit()


def get_user_by_id_text(user_id: str, db: Session) -> User | None:
    return db.query(User).filter(cast(User.id, String) == user_id).first()


def raise_follow_feature_unavailable(db: Session, exc: ProgrammingError):
    db.rollback()
    if "user_follows" in str(exc).lower():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Follow system is not initialized yet. Run the latest database migration.",
        )
    raise exc


def is_missing_last_seen_column_error(exc: ProgrammingError) -> bool:
    db_error_text = str(getattr(exc, "orig", exc)).lower()
    return "last_seen" in db_error_text and "does not exist" in db_error_text


# --- Get Current User ---
@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return build_user_response(current_user)


@router.post("/presence/heartbeat", response_model=UserResponse)
def update_presence(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_id = str(current_user.id)
    try:
        touch_user_presence(current_user, db)
        refreshed_user = get_user_by_id_text(user_id, db)
        if refreshed_user is not None:
            return build_user_response(refreshed_user)
    except ProgrammingError as exc:
        db.rollback()
        if not is_missing_last_seen_column_error(exc):
            # Some environments have legacy user ID types. Presence should be best-effort,
            # so we avoid failing the request when presence persistence is unavailable.
            safe_user = get_user_by_id_text(user_id, db)
            if safe_user is not None:
                return build_user_response(safe_user)
            raise
    safe_user = get_user_by_id_text(user_id, db)
    if safe_user is not None:
        return build_user_response(safe_user)
    return build_user_response(current_user)


# --- Create a new user (Registration) ---
@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    normalized_email = user.email.strip().lower()
    normalized_username = (user.username or normalized_email).strip().lower()
    normalized_mobile = user.mobile.strip()

    # Validate school for student / lecturer
    if user.role in (UserRole.student, UserRole.lecturer) and not user.school:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="School/University is required for students and lecturers."
    )

    # Check username
    if db.query(User).filter(User.username == normalized_username).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists")

    # Check email
    if db.query(User).filter(User.email == normalized_email).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="An account with this email already exists")

    # Check mobile uniqueness
    if normalized_mobile and db.query(User).filter(User.mobile == normalized_mobile).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Mobile number already registered")

    # Auto-generate user code
    user_code = generate_user_code(user.role, db)

    has_active_admin = (
        db.query(User)
        .filter(User.role == UserRole.admin, User.access_status == AccessStatus.active)
        .first()
        is not None
    )

    # Bootstrap rule:
    # - students are auto-approved
    # - the first active admin is auto-approved so the system can be managed
    # - everyone else starts pending
    access_status = AccessStatus.pending
    if user.role == UserRole.student:
        access_status = AccessStatus.active
    elif user.role == UserRole.admin and not has_active_admin:
        access_status = AccessStatus.active

    hashed_pw = hash_password(user.password)

    new_user = User(
        user_code=user_code,
        first_name=user.first_name,
        last_name=user.last_name,
        username=normalized_username,
        email=normalized_email,
        password=hashed_pw,
        role=user.role,
        description=user.description,
        education_status=user.education_status,
        city=user.city,
        country=user.country,
        school=user.school,
        mobile=normalized_mobile,
        access_status=access_status,
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration failed because a unique field already exists. Please check email, mobile number, and username.",
        )
    return build_user_response(new_user)


# --- Get all users ---
@router.get("/", response_model=List[UserResponse])
def get_all_users(
    role: UserRole | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(User)
    if role is not None:
        query = query.filter(User.role == role)
    return [build_user_response(user) for user in query.all()]


# --- Discover users ---
@router.get("/discover", response_model=List[UserDiscoverResponse])
def discover_users(
    limit: int = Query(default=8, ge=1, le=25),
    roles: List[UserRole] | None = Query(default=None),
    exclude_followed: bool = Query(default=False),
    exclude_user_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (
        db.query(User)
        .filter(User.id != current_user.id)
        .filter(
            or_(
                User.access_status == AccessStatus.active,
                User.access_status.is_(None),
            )
        )
    )

    if roles:
        query = query.filter(User.role.in_(roles))

    if exclude_user_id is not None:
        query = query.filter(User.id != exclude_user_id)

    if exclude_followed:
        followed_select = (
            select(UserFollow.following_id)
            .where(UserFollow.follower_id == current_user.id)
        )
        query = query.filter(User.id.not_in(followed_select))

    users = (
        query
        .order_by(User.created_at.desc(), User.id.desc())
        .limit(limit)
        .all()
    )
    return [build_user_discover_response(user, current_user, db) for user in users]


@router.get("/online-users", response_model=List[OnlineUserResponse])
def get_online_users(
    limit: int = Query(default=10, ge=1, le=30),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    now = datetime.now(timezone.utc)
    online_cutoff = now - timedelta(minutes=2)

    followed_select = (
        select(UserFollow.following_id)
        .where(UserFollow.follower_id == current_user.id)
    )

    try:
        users = (
            db.query(User)
            .options(undefer(User.last_seen))
            .filter(User.id != current_user.id)
            .filter(User.access_status == AccessStatus.active)
            .filter(User.last_seen.is_not(None))
            .filter(User.last_seen >= online_cutoff)
            .order_by(User.id.in_(followed_select).desc(), User.last_seen.desc(), User.id.desc())
            .limit(limit)
            .all()
        )
    except ProgrammingError as exc:
        db.rollback()
        if is_missing_last_seen_column_error(exc):
            return []
        raise

    return [
        OnlineUserResponse(
            **build_user_summary_response(user, current_user, db).model_dump(),
            last_seen=user.last_seen,
            is_online=is_user_online(user, now),
        )
        for user in users
    ]


@router.get("/{user_id}/profile", response_model=UserProfileResponse)
def get_user_profile(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile_user = get_user_or_404(user_id, db)
    return build_user_profile_response(profile_user, current_user, db)


@router.get("/{user_id}/follow-status", response_model=FollowStatusResponse)
def get_user_follow_status(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile_user = get_user_or_404(user_id, db)
    if profile_user.id == current_user.id:
        return FollowStatusResponse(is_following=False)
    try:
        return FollowStatusResponse(
            is_following=is_following_user(current_user.id, profile_user.id, db)
        )
    except ProgrammingError as exc:
        raise_follow_feature_unavailable(db, exc)


@router.post("/{user_id}/follow", response_model=UserProfileResponse)
def follow_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile_user = get_user_or_404(user_id, db)

    if profile_user.id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot follow yourself")

    try:
        existing_follow = (
            db.query(UserFollow)
            .filter(
                UserFollow.follower_id == current_user.id,
                UserFollow.following_id == profile_user.id,
            )
            .first()
        )
    except ProgrammingError as exc:
        raise_follow_feature_unavailable(db, exc)
    if existing_follow:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You are already following this user")

    follow = UserFollow(follower_id=current_user.id, following_id=profile_user.id)
    try:
        db.add(follow)
        db.commit()
    except ProgrammingError as exc:
        raise_follow_feature_unavailable(db, exc)

    return build_user_profile_response(profile_user, current_user, db)


@router.delete("/{user_id}/follow", response_model=UserProfileResponse)
def unfollow_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile_user = get_user_or_404(user_id, db)

    if profile_user.id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot unfollow yourself")

    try:
        follow = (
            db.query(UserFollow)
            .filter(
                UserFollow.follower_id == current_user.id,
                UserFollow.following_id == profile_user.id,
            )
            .first()
        )
    except ProgrammingError as exc:
        raise_follow_feature_unavailable(db, exc)
    if not follow:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Follow relationship not found")

    try:
        db.delete(follow)
        db.commit()
    except ProgrammingError as exc:
        raise_follow_feature_unavailable(db, exc)

    return build_user_profile_response(profile_user, current_user, db)


@router.get("/{user_id}/followers", response_model=List[UserSummaryResponse])
def get_user_followers(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_user_or_404(user_id, db)
    try:
        users = (
            db.query(User)
            .join(UserFollow, User.id == UserFollow.follower_id)
            .filter(UserFollow.following_id == user_id)
            .order_by(UserFollow.created_at.desc(), User.id.desc())
            .all()
        )
        return [build_user_summary_response(user, current_user, db) for user in users]
    except ProgrammingError as exc:
        raise_follow_feature_unavailable(db, exc)


@router.get("/{user_id}/following", response_model=List[UserSummaryResponse])
def get_user_following(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_user_or_404(user_id, db)
    try:
        users = (
            db.query(User)
            .join(UserFollow, User.id == UserFollow.following_id)
            .filter(UserFollow.follower_id == user_id)
            .order_by(UserFollow.created_at.desc(), User.id.desc())
            .all()
        )
        return [build_user_summary_response(user, current_user, db) for user in users]
    except ProgrammingError as exc:
        raise_follow_feature_unavailable(db, exc)


# --- Get user by ID ---
@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: str, db: Session = Depends(get_db),
             current_user: User = Depends(get_current_user)):
    user = get_user_or_404(user_id, db)
    return build_user_response(user)


# --- Update user ---
@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: str, user_update: UserUpdate,
                db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    if str(current_user.id) != str(user_id) and current_user.role.value != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this user")

    user_q = db.query(User).filter(User.id == user_id)
    user_obj = user_q.first()
    if not user_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    update_data = user_update.model_dump(exclude_unset=True, exclude={"company_name", "industry", "company_size", "industry_expertise", "years_of_experience"})

    next_email = (update_data.get("email") or user_obj.email).strip().lower()
    next_username = (update_data.get("username") or user_obj.username).strip().lower()
    next_mobile = (update_data.get("mobile") or user_obj.mobile or "").strip() or None
    next_role = update_data.get("role") or user_obj.role

    existing_email = db.query(User).filter(User.email == next_email, User.id != user_obj.id).first()
    if existing_email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="An account with this email already exists")

    existing_username = db.query(User).filter(User.username == next_username, User.id != user_obj.id).first()
    if existing_username:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists")

    if next_mobile:
        existing_mobile = db.query(User).filter(User.mobile == next_mobile, User.id != user_obj.id).first()
        if existing_mobile:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Mobile number already registered")

    update_data["email"] = next_email
    update_data["username"] = next_username
    update_data["mobile"] = next_mobile

    if "password" in update_data:
        update_data["password"] = hash_password(update_data["password"])

    if next_role in (UserRole.student, UserRole.lecturer):
        next_school = update_data.get("school", user_obj.school)
        next_education = update_data.get("education_status", user_obj.education_status)
        if not next_school:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="School/University is required for students and lecturers.")
        if not next_education:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Education level is required for students and lecturers.")

    role_description = update_data.get("description", user_obj.description)
    if next_role == UserRole.company:
        company_name = (user_update.company_name or parse_role_profile_fields(user_obj).get("company_name") or f"{user_obj.first_name} {user_obj.last_name}").strip()
        industry = (user_update.industry or parse_role_profile_fields(user_obj).get("industry") or "").strip()
        company_size = (user_update.company_size or parse_role_profile_fields(user_obj).get("company_size") or "").strip()
        role_description = " | ".join(part for part in [company_name, industry, f"Size: {company_size}" if company_size else ""] if part)
    elif next_role == UserRole.tech_lead:
        expertise = (user_update.industry_expertise or parse_role_profile_fields(user_obj).get("industry_expertise") or "").strip()
        years = (user_update.years_of_experience or parse_role_profile_fields(user_obj).get("years_of_experience") or "").strip()
        role_description = " | ".join(part for part in [f"Expert in {expertise}" if expertise else "", f"{years} years" if years else ""] if part)

    update_data["description"] = role_description

    user_q.update(update_data, synchronize_session=False)
    db.commit()
    db.refresh(user_obj)
    return build_user_response(user_obj)


# --- Delete user ---
@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: str, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    if str(current_user.id) != str(user_id) and current_user.role.value != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this user")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    db.delete(user)
    db.commit()
    return None


# --- Get user by username ---
@router.get("/username/{username}", response_model=UserResponse)
def get_user_by_username(username: str, db: Session = Depends(get_db),
                         current_user: User = Depends(get_current_user)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


# --- Upload CV ---
@router.post("/{user_id}/cv", response_model=UserResponse)
def upload_cv(user_id: str, file: UploadFile = File(...),
              db: Session = Depends(get_db),
              current_user: User = Depends(get_current_user)):
    if str(current_user.id) != str(user_id) and current_user.role.value != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Validate file type
    allowed = {"application/pdf", "application/msword",
               "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Only PDF and Word documents are accepted.")

    ext = os.path.splitext(file.filename or "cv.pdf")[1] or ".pdf"
    filename = f"{user_id}_{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Remove old file if exists
    if user.cv_path and os.path.exists(user.cv_path):
        try:
            os.remove(user.cv_path)
        except OSError:
            pass

    user.cv_path = filepath
    db.commit()
    db.refresh(user)
    return build_user_response(user)


@router.post("/{user_id}/avatar", response_model=UserResponse)
def upload_avatar(
    user_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if str(current_user.id) != str(user_id) and current_user.role.value != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    allowed = {"image/jpeg", "image/png", "image/webp"}
    if file.content_type not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPG, PNG, and WebP images are accepted.",
        )

    ext = os.path.splitext(file.filename or "avatar.png")[1].lower() or ".png"
    filename = f"{user_id}_{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(AVATAR_UPLOAD_DIR, filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    if user.avatar_path and os.path.exists(user.avatar_path):
        try:
            os.remove(user.avatar_path)
        except OSError:
            pass

    user.avatar_path = filepath
    db.commit()
    db.refresh(user)
    return build_user_response(user)


@router.post("/{user_id}/cover", response_model=UserResponse)
def upload_cover(
    user_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if str(current_user.id) != str(user_id) and current_user.role.value != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    allowed = {"image/jpeg", "image/png", "image/webp"}
    if file.content_type not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPG, PNG, and WebP images are accepted.",
        )

    ext = os.path.splitext(file.filename or "cover.jpg")[1].lower() or ".jpg"
    filename = f"{user_id}_{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(COVER_UPLOAD_DIR, filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    if user.cover_path and os.path.exists(user.cover_path):
        try:
            os.remove(user.cover_path)
        except OSError:
            pass

    user.cover_path = filepath
    db.commit()
    db.refresh(user)
    return build_user_response(user)


# --- Download CV ---
@router.get("/{user_id}/cv/download")
def download_cv(user_id: str, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.cv_path:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="CV not found")
    if not os.path.exists(user.cv_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="CV file missing on server")
    return FileResponse(user.cv_path, filename=f"{user.first_name}_{user.last_name}_CV{os.path.splitext(user.cv_path)[1]}")
