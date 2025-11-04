from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from auth_utils import get_current_user
from models import User, Forum, ForumPost
from schemas import (
    Forum as ForumSchema,
    ForumCreate,
    ForumPost as ForumPostSchema,
    ForumPostCreate
)
from websocket_manager import manager
import json

router = APIRouter()

@router.get("/", response_model=List[ForumSchema])
async def get_forums(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all forums"""
    forums = db.query(Forum).all()
    return forums

@router.post("/", response_model=ForumSchema)
async def create_forum(
    forum_data: ForumCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new forum (researchers only)"""
    if current_user.role != "researcher":
        raise HTTPException(status_code=403, detail="Only researchers can create forums")
    
    forum = Forum(**forum_data.dict())
    db.add(forum)
    db.commit()
    db.refresh(forum)
    
    # Broadcast new forum to all connected users
    await manager.broadcast(json.dumps({
        "type": "new_forum",
        "forum": {
            "id": forum.id,
            "title": forum.title,
            "description": forum.description,
            "category": forum.category
        }
    }))
    
    return forum

@router.get("/{forum_id}/posts")
async def get_forum_posts(
    forum_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all posts in a forum"""
    posts = db.query(ForumPost, User).join(User).filter(
        ForumPost.forum_id == forum_id,
        ForumPost.parent_id == None  # Only top-level posts
    ).all()
    
    result = []
    for post, author in posts:
        # Get replies
        replies = db.query(ForumPost, User).join(User).filter(
            ForumPost.parent_id == post.id
        ).all()
        
        result.append({
            "id": post.id,
            "content": post.content,
            "created_at": post.created_at,
            "author": {
                "id": author.id,
                "full_name": author.full_name,
                "role": author.role
            },
            "replies": [{
                "id": reply.id,
                "content": reply.content,
                "created_at": reply.created_at,
                "author": {
                    "id": reply_author.id,
                    "full_name": reply_author.full_name,
                    "role": reply_author.role
                }
            } for reply, reply_author in replies]
        })
    
    return result

@router.post("/{forum_id}/posts", response_model=ForumPostSchema)
async def create_post(
    forum_id: int,
    post_data: ForumPostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new post in a forum"""
    # Patients can create posts, researchers can create posts and replies
    if post_data.parent_id and current_user.role == "patient":
        raise HTTPException(status_code=403, detail="Only researchers can reply to posts")
    
    post = ForumPost(
        forum_id=forum_id,
        author_id=current_user.id,
        content=post_data.content,
        parent_id=post_data.parent_id
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    
    # Broadcast new post to all connected users
    await manager.broadcast(json.dumps({
        "type": "new_post",
        "forum_id": forum_id,
        "post": {
            "id": post.id,
            "content": post.content,
            "author": {
                "id": current_user.id,
                "full_name": current_user.full_name,
                "role": current_user.role
            },
            "parent_id": post.parent_id
        }
    }))
    
    return post

@router.delete("/{forum_id}/posts/{post_id}")
async def delete_post(
    forum_id: int,
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a post (only author can delete)"""
    post = db.query(ForumPost).filter(
        ForumPost.id == post_id,
        ForumPost.forum_id == forum_id
    ).first()
    
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if post.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own posts")
    
    db.delete(post)
    db.commit()
    
    return {"message": "Post deleted successfully"}
