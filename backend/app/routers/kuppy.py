from datetime import datetime, timedelta, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.db.database import get_db
from app.models.kuppy import (
    KuppyOffer,
    KuppyOfferStatus,
    KuppyParticipant,
    KuppyRequest,
    KuppyRequestStatus,
    KuppyRequestVote,
    KuppySession,
    KuppySessionStatus,
)
from app.models.user import User, UserRole
from app.schemas.kuppy import (
    KuppyJoinResponse,
    KuppyOfferCreate,
    KuppyOfferResponse,
    KuppyRequestCreate,
    KuppyRequestResponse,
    KuppySessionCreate,
    KuppySessionResponse,
)
from app.utils.autho import get_current_user

router = APIRouter(prefix="/kuppy", tags=["Kuppy Sessions"])


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def ensure_utc(value: datetime | None) -> datetime | None:
    if value is None:
        return None
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def require_role(current_user: User, allowed_roles: set[UserRole], message: str) -> None:
    if current_user.role not in allowed_roles:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=message)


def get_request_or_404(db: Session, request_id: int) -> KuppyRequest:
    request = (
        db.query(KuppyRequest)
        .options(
            joinedload(KuppyRequest.student),
            joinedload(KuppyRequest.votes),
            joinedload(KuppyRequest.offers).joinedload(KuppyOffer.lecturer),
        )
        .filter(KuppyRequest.id == request_id)
        .first()
    )
    if not request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kuppy request not found")
    return request


def get_offer_or_404(db: Session, request_id: int, offer_id: int) -> KuppyOffer:
    offer = (
        db.query(KuppyOffer)
        .options(joinedload(KuppyOffer.lecturer), joinedload(KuppyOffer.request))
        .filter(KuppyOffer.id == offer_id, KuppyOffer.request_id == request_id)
        .first()
    )
    if not offer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Offer not found")
    return offer


def get_session_or_404(db: Session, session_id: int) -> KuppySession:
    session = (
        db.query(KuppySession)
        .options(
            joinedload(KuppySession.lecturer),
            joinedload(KuppySession.participants).joinedload(KuppyParticipant.user),
        )
        .filter(KuppySession.id == session_id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return session


def sync_session_state(session: KuppySession) -> None:
    now = utc_now()
    scheduled_start = ensure_utc(session.scheduled_start)
    scheduled_end = ensure_utc(session.scheduled_end)

    if scheduled_start is not None:
        session.scheduled_start = scheduled_start
    if scheduled_end is not None:
        session.scheduled_end = scheduled_end
    if session.auto_delete_at is not None:
        session.auto_delete_at = ensure_utc(session.auto_delete_at)

    if session.status == KuppySessionStatus.cancelled:
        return

    if session.scheduled_end <= now:
        session.status = KuppySessionStatus.completed
        session.auto_delete_at = session.scheduled_end + timedelta(hours=1)
    elif session.scheduled_start <= now:
        session.status = KuppySessionStatus.live
    else:
        session.status = KuppySessionStatus.scheduled
        session.auto_delete_at = None


def cleanup_expired_sessions(db: Session) -> None:
    now = utc_now()
    sessions = db.query(KuppySession).all()
    has_changes = False

    for session in sessions:
        previous_status = session.status
        previous_auto_delete_at = session.auto_delete_at
        sync_session_state(session)
        if session.status != previous_status or session.auto_delete_at != previous_auto_delete_at:
            has_changes = True

        if session.status == KuppySessionStatus.completed and session.auto_delete_at and session.auto_delete_at <= now:
            if session.request:
                session.request.status = KuppyRequestStatus.completed
            db.delete(session)
            has_changes = True

    if has_changes:
        db.commit()


def build_session_response(session: KuppySession) -> KuppySession:
    session.participants.sort(key=lambda participant: participant.joined_at)
    return session


@router.get("/requests", response_model=List[KuppyRequestResponse])
def get_requests(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cleanup_expired_sessions(db)
    requests = (
        db.query(KuppyRequest)
        .options(
            joinedload(KuppyRequest.student),
            joinedload(KuppyRequest.votes),
            joinedload(KuppyRequest.offers).joinedload(KuppyOffer.lecturer),
        )
        .order_by(KuppyRequest.created_at.desc())
        .all()
    )
    return requests


@router.post("/requests", response_model=KuppyRequestResponse, status_code=status.HTTP_201_CREATED)
def create_request(
    payload: KuppyRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_role(current_user, {UserRole.student}, "Only students can create Kuppy requests")
    cleanup_expired_sessions(db)

    request = KuppyRequest(
        student_id=current_user.id,
        module_name=payload.module_name,
        description=payload.description,
        requested_before=payload.requested_before,
        current_student_count=payload.current_student_count,
    )
    db.add(request)
    db.commit()
    return get_request_or_404(db, request.id)


@router.post("/requests/{request_id}/vote", response_model=KuppyRequestResponse)
def vote_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_role(current_user, {UserRole.student}, "Only students can vote for Kuppy requests")
    cleanup_expired_sessions(db)

    request = get_request_or_404(db, request_id)
    if request.status != KuppyRequestStatus.open:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Voting is only available for open requests")

    existing_vote = (
        db.query(KuppyRequestVote)
        .filter(KuppyRequestVote.request_id == request_id, KuppyRequestVote.user_id == current_user.id)
        .first()
    )
    if existing_vote:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You have already voted for this request")

    db.add(KuppyRequestVote(request_id=request_id, user_id=current_user.id))
    db.commit()
    return get_request_or_404(db, request_id)


@router.delete("/requests/{request_id}/vote", response_model=KuppyRequestResponse)
def remove_vote(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_role(current_user, {UserRole.student}, "Only students can remove Kuppy request votes")
    cleanup_expired_sessions(db)

    vote = (
        db.query(KuppyRequestVote)
        .filter(KuppyRequestVote.request_id == request_id, KuppyRequestVote.user_id == current_user.id)
        .first()
    )
    if not vote:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vote not found")

    db.delete(vote)
    db.commit()
    return get_request_or_404(db, request_id)


@router.post("/requests/{request_id}/offers", response_model=KuppyOfferResponse, status_code=status.HTTP_201_CREATED)
def create_offer(
    request_id: int,
    payload: KuppyOfferCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_role(current_user, {UserRole.lecturer}, "Only lecturers can offer availability for Kuppy requests")
    cleanup_expired_sessions(db)

    request = get_request_or_404(db, request_id)
    request.requested_before = ensure_utc(request.requested_before)
    if request.status != KuppyRequestStatus.open:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This request is no longer open for offers")

    if payload.availability_end > request.requested_before:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Offer time must finish before the student's requested deadline",
        )

    offer = KuppyOffer(
        request_id=request_id,
        lecturer_id=current_user.id,
        availability_start=payload.availability_start,
        availability_end=payload.availability_end,
        description=payload.description,
    )
    db.add(offer)
    db.commit()

    return get_offer_or_404(db, request_id, offer.id)


@router.post("/requests/{request_id}/offers/{offer_id}/confirm", response_model=KuppySessionResponse)
def confirm_offer(
    request_id: int,
    offer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_role(current_user, {UserRole.student}, "Only students can confirm Kuppy offers")
    cleanup_expired_sessions(db)

    request = get_request_or_404(db, request_id)
    if request.student_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the requesting student can confirm an offer")
    if request.status != KuppyRequestStatus.open:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This request has already been scheduled")
    if request.session is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A session already exists for this request")

    offer = get_offer_or_404(db, request_id, offer_id)
    if offer.status != KuppyOfferStatus.open:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This offer is no longer available")

    session = KuppySession(
        lecturer_id=offer.lecturer_id,
        request_id=request.id,
        title=f"{request.module_name} Kuppy Session",
        module_name=request.module_name,
        description=request.description,
        scheduled_start=offer.availability_start,
        scheduled_end=offer.availability_end,
        max_students=request.current_student_count,
        status=KuppySessionStatus.scheduled,
    )
    request.status = KuppyRequestStatus.scheduled
    request.selected_offer_id = offer.id
    offer.status = KuppyOfferStatus.selected

    other_offers = (
        db.query(KuppyOffer)
        .filter(KuppyOffer.request_id == request_id, KuppyOffer.id != offer.id, KuppyOffer.status == KuppyOfferStatus.open)
        .all()
    )
    for other_offer in other_offers:
        other_offer.status = KuppyOfferStatus.withdrawn

    db.add(session)
    db.flush()
    db.add(KuppyParticipant(session_id=session.id, user_id=current_user.id))
    db.commit()

    session = get_session_or_404(db, session.id)
    sync_session_state(session)
    db.commit()
    return build_session_response(session)


@router.get("/sessions", response_model=List[KuppySessionResponse])
def get_all_sessions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cleanup_expired_sessions(db)
    sessions = (
        db.query(KuppySession)
        .options(
            joinedload(KuppySession.lecturer),
            joinedload(KuppySession.participants).joinedload(KuppyParticipant.user),
        )
        .filter(
            or_(
                KuppySession.status.in_([KuppySessionStatus.scheduled, KuppySessionStatus.live]),
                KuppySession.auto_delete_at > utc_now(),
            )
        )
        .order_by(KuppySession.scheduled_start.asc())
        .all()
    )

    changed = False
    for session in sessions:
        previous_status = session.status
        sync_session_state(session)
        if previous_status != session.status:
            changed = True

    if changed:
        db.commit()

    return [build_session_response(session) for session in sessions if session.status != KuppySessionStatus.completed or (session.auto_delete_at and session.auto_delete_at > utc_now())]


@router.get("/sessions/{session_id}", response_model=KuppySessionResponse)
def get_session(session_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cleanup_expired_sessions(db)
    session = get_session_or_404(db, session_id)
    sync_session_state(session)
    db.commit()
    return build_session_response(session)


@router.post("/sessions", response_model=KuppySessionResponse, status_code=status.HTTP_201_CREATED)
def create_session(
    payload: KuppySessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_role(current_user, {UserRole.lecturer}, "Only lecturers can create Kuppy sessions")
    cleanup_expired_sessions(db)

    session = KuppySession(
        lecturer_id=current_user.id,
        title=payload.title,
        module_name=payload.module_name,
        description=payload.description,
        scheduled_start=payload.scheduled_start,
        scheduled_end=payload.scheduled_end,
        max_students=payload.max_students,
        status=KuppySessionStatus.scheduled,
    )
    db.add(session)
    db.commit()
    session = get_session_or_404(db, session.id)
    return build_session_response(session)


@router.post("/sessions/{session_id}/join", response_model=KuppyJoinResponse)
def join_session(session_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    require_role(current_user, {UserRole.student}, "Only students can join Kuppy sessions")
    cleanup_expired_sessions(db)

    session = get_session_or_404(db, session_id)
    sync_session_state(session)
    db.commit()

    if session.status != KuppySessionStatus.scheduled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Students can only join scheduled sessions before they start")

    if session.lecturer_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="The lecturer cannot join as a student participant")

    if len(session.participants) >= session.max_students:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This Kuppy session is already full")

    existing = (
        db.query(KuppyParticipant)
        .filter(KuppyParticipant.session_id == session_id, KuppyParticipant.user_id == current_user.id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You have already joined this session")

    db.add(KuppyParticipant(session_id=session_id, user_id=current_user.id))
    db.commit()
    return {"message": "Successfully joined the Kuppy session"}


@router.delete("/sessions/{session_id}/leave", response_model=KuppyJoinResponse)
def leave_session(session_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    require_role(current_user, {UserRole.student}, "Only students can leave Kuppy sessions")
    cleanup_expired_sessions(db)

    session = get_session_or_404(db, session_id)
    sync_session_state(session)
    db.commit()

    if session.status != KuppySessionStatus.scheduled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You can only leave before the Kuppy session starts")

    participant = (
        db.query(KuppyParticipant)
        .filter(KuppyParticipant.session_id == session_id, KuppyParticipant.user_id == current_user.id)
        .first()
    )
    if not participant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="You are not participating in this session")

    db.delete(participant)
    db.commit()
    return {"message": "Successfully left the Kuppy session"}
