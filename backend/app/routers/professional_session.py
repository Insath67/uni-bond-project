from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.db.database import get_db
from app.models.professional_session import ProfessionalSession, ProfessionalSessionRegistration
from app.models.user import User, UserRole
from app.schemas.professional_session import (
    ProfessionalSessionAttendee,
    ProfessionalSessionAttendeesResponse,
    ProfessionalSessionCreate,
    ProfessionalSessionRegisterResponse,
    ProfessionalSessionResponse,
)
from app.utils.autho import get_current_user

router = APIRouter(prefix="/professional-sessions", tags=["Professional Sessions"])


def _split_tags(tags_csv: str) -> list[str]:
    return [tag.strip() for tag in tags_csv.split(",") if tag.strip()]


def _to_tags_csv(tags: list[str]) -> str:
    cleaned = [tag.strip() for tag in tags if tag and tag.strip()]
    return ",".join(cleaned)


def _can_see_zoom_link(session: ProfessionalSession, current_user: User, is_registered: bool) -> bool:
    if current_user.role == UserRole.admin:
        return True
    if current_user.id == session.creator_id:
        return True
    return is_registered


def _build_session_response(session: ProfessionalSession, current_user: User) -> ProfessionalSessionResponse:
    registered_count = len(session.registrations)
    available_seats = max(0, session.seat_count - registered_count)
    is_registered = any(reg.student_id == current_user.id for reg in session.registrations)
    zoom_link = session.zoom_link if _can_see_zoom_link(session, current_user, is_registered) else None

    return ProfessionalSessionResponse(
        id=session.id,
        title=session.title,
        speaker=session.speaker,
        description=session.description,
        session_date=session.session_date,
        session_time=session.session_time,
        seat_count=session.seat_count,
        available_seats=available_seats,
        registered_count=registered_count,
        tags=_split_tags(session.tags_csv),
        creator_id=str(session.creator_id),
        is_registered=is_registered,
        zoom_link=zoom_link,
    )


@router.get("/my-sessions", response_model=list[ProfessionalSessionResponse])
def get_my_registered_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.student:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only students can view registered sessions")

    sessions = (
        db.query(ProfessionalSession)
        .join(ProfessionalSession.registrations)
        .options(joinedload(ProfessionalSession.registrations))
        .filter(ProfessionalSessionRegistration.student_id == current_user.id)
        .order_by(ProfessionalSession.session_date.asc(), ProfessionalSession.session_time.asc())
        .all()
    )
    return [_build_session_response(session, current_user) for session in sessions]

@router.get("", response_model=list[ProfessionalSessionResponse])
def list_professional_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sessions = (
        db.query(ProfessionalSession)
        .options(joinedload(ProfessionalSession.registrations))
        .order_by(ProfessionalSession.session_date.asc(), ProfessionalSession.session_time.asc())
        .all()
    )
    return [_build_session_response(session, current_user) for session in sessions]


@router.post("", response_model=ProfessionalSessionResponse, status_code=status.HTTP_201_CREATED)
def create_professional_session(
    payload: ProfessionalSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in {UserRole.tech_lead, UserRole.admin}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only tech leads can create sessions")

    speaker_name = f"{current_user.first_name} {current_user.last_name}".strip() or current_user.email
    session = ProfessionalSession(
        creator_id=current_user.id,
        title=payload.title,
        speaker=speaker_name,
        description=payload.description,
        session_date=payload.session_date,
        session_time=payload.session_time,
        zoom_link=payload.zoom_link,
        seat_count=payload.seat_count,
        tags_csv=_to_tags_csv(payload.tags),
    )
    db.add(session)
    db.commit()

    created = (
        db.query(ProfessionalSession)
        .options(joinedload(ProfessionalSession.registrations))
        .filter(ProfessionalSession.id == session.id)
        .first()
    )
    if not created:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create session")
    return _build_session_response(created, current_user)


@router.post("/{session_id}/register", response_model=ProfessionalSessionRegisterResponse)
def register_for_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.student:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only students can register")

    session = (
        db.query(ProfessionalSession)
        .options(joinedload(ProfessionalSession.registrations))
        .filter(ProfessionalSession.id == session_id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    already_registered = any(reg.student_id == current_user.id for reg in session.registrations)
    if already_registered:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You are already registered for this session")

    if len(session.registrations) >= session.seat_count:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No seats available for this session")

    registration = ProfessionalSessionRegistration(session_id=session.id, student_id=current_user.id)
    db.add(registration)
    db.commit()

    return ProfessionalSessionRegisterResponse(message="Registered successfully")


@router.put("/{session_id}", response_model=ProfessionalSessionResponse)
def update_professional_session(
    session_id: int,
    payload: ProfessionalSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = (
        db.query(ProfessionalSession)
        .options(joinedload(ProfessionalSession.registrations))
        .filter(ProfessionalSession.id == session_id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    if current_user.role != UserRole.admin and current_user.id != session.creator_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to update this session")

    session.title = payload.title
    session.description = payload.description
    session.session_date = payload.session_date
    session.session_time = payload.session_time
    session.zoom_link = payload.zoom_link
    session.seat_count = payload.seat_count
    session.tags_csv = _to_tags_csv(payload.tags)

    db.commit()
    db.refresh(session)
    return _build_session_response(session, current_user)


@router.delete("/{session_id}", response_model=ProfessionalSessionRegisterResponse)
def delete_professional_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = db.query(ProfessionalSession).filter(ProfessionalSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    if current_user.role != UserRole.admin and current_user.id != session.creator_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to delete this session")

    db.delete(session)
    db.commit()
    return ProfessionalSessionRegisterResponse(message="Session deleted")


@router.get("/{session_id}/attendees", response_model=ProfessionalSessionAttendeesResponse)
def list_session_attendees(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = (
        db.query(ProfessionalSession)
        .options(
            joinedload(ProfessionalSession.registrations).joinedload(ProfessionalSessionRegistration.student)
        )
        .filter(ProfessionalSession.id == session_id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    if current_user.role != UserRole.admin and current_user.id != session.creator_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to view attendees")

    attendees = [
        ProfessionalSessionAttendee(
            student_id=str(reg.student_id),
            student_name=(
                f"{reg.student.first_name} {reg.student.last_name}".strip()
                if reg.student
                else "Student"
            ),
            student_email=reg.student.email if reg.student else "",
            registered_at=reg.registered_at,
        )
        for reg in session.registrations
    ]

    return ProfessionalSessionAttendeesResponse(session_id=session.id, attendees=attendees)
