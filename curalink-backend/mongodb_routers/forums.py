from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime

from mongodb_models import Forum, ForumPost, User
from mongodb_schemas import ForumCreate, ForumResponse, ForumPostCreate, ForumPostResponse
from mongodb_auth_utils import get_current_user

router = APIRouter()

@router.post("/", response_model=ForumResponse)
async def create_forum(forum_data: ForumCreate, current_user: User = Depends(get_current_user)):
    forum = Forum(
        **forum_data.dict(),
        created_by=str(current_user.id),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    await forum.insert()
    
    return ForumResponse(
        id=str(forum.id),
        **forum_data.dict(),
        created_by=str(current_user.id),
        is_active=forum.is_active,
        post_count=forum.post_count,
        created_at=forum.created_at,
        updated_at=forum.updated_at
    )

@router.get("/", response_model=List[ForumResponse])
async def get_forums(skip: int = 0, limit: int = 100):
    forums = await Forum.find_all().skip(skip).limit(limit).to_list()
    return [
        ForumResponse(
            id=str(forum.id),
            title=forum.title,
            description=forum.description,
            category=forum.category,
            created_by=forum.created_by,
            is_active=forum.is_active,
            post_count=forum.post_count,
            created_at=forum.created_at,
            updated_at=forum.updated_at
        ) for forum in forums
    ]

@router.get("/{forum_id}", response_model=ForumResponse)
async def get_forum(forum_id: str):
    forum = await Forum.get(forum_id)
    if not forum:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Forum not found"
        )
    
    return ForumResponse(
        id=str(forum.id),
        title=forum.title,
        description=forum.description,
        category=forum.category,
        created_by=forum.created_by,
        is_active=forum.is_active,
        post_count=forum.post_count,
        created_at=forum.created_at,
        updated_at=forum.updated_at
    )
