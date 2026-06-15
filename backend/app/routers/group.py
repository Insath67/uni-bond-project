from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.group import Group, GroupMember, DiscussionMessage
from app.schemas.group import GroupCreate, GroupResponse, GroupJoinResponse, DiscussionMessageCreate, DiscussionMessageResponse
from app.models.user import User
from app.utils.autho import get_current_user

router = APIRouter(prefix="/groups", tags=["Groups"])

@router.post("/", response_model=GroupResponse)
def create_group(group: GroupCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_group = Group(name=group.name, description=group.description)
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    
    # Add creator as a member automatically
    member = GroupMember(group_id=db_group.id, user_id=current_user.id)
    db.add(member)
    db.commit()
    db.refresh(db_group)
    
    return db_group

@router.get("/", response_model=List[GroupResponse])
def get_all_groups(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    groups = db.query(Group).order_by(Group.created_at.desc()).all()
    return groups

@router.get("/{group_id}", response_model=GroupResponse)
def get_group(group_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")
    return group

@router.post("/{group_id}/join", response_model=GroupJoinResponse)
def join_group(group_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")
        
    existing_member = db.query(GroupMember).filter(GroupMember.group_id == group_id, GroupMember.user_id == current_user.id).first()
    if existing_member:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already a member")
        
    member = GroupMember(group_id=group_id, user_id=current_user.id)
    db.add(member)
    db.commit()
    return {"message": "Successfully joined the group"}

@router.delete("/{group_id}/leave")
def leave_group(group_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    member = db.query(GroupMember).filter(GroupMember.group_id == group_id, GroupMember.user_id == current_user.id).first()
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="You are not a member of this group")
        
    db.delete(member)
    db.commit()
    return {"message": "Successfully left the group"}

@router.post("/{group_id}/discussions", response_model=DiscussionMessageResponse)
def add_discussion(group_id: int, discussion: DiscussionMessageCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    member = db.query(GroupMember).filter(GroupMember.group_id == group_id, GroupMember.user_id == current_user.id).first()
    if not member:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Must be a member to post in discussions")
        
    db_discussion = DiscussionMessage(group_id=group_id, author_id=current_user.id, content=discussion.content)
    db.add(db_discussion)
    db.commit()
    db.refresh(db_discussion)
    return db_discussion
