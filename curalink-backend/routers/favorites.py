from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json

from database import get_db
from auth_utils import get_current_user
from models import User, Favorite
from schemas import Favorite as FavoriteSchema, FavoriteCreate

router = APIRouter()

@router.get("/", response_model=List[FavoriteSchema])
async def get_favorites(
    item_type: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all favorites for the current user"""
    query = db.query(Favorite).filter(Favorite.user_id == current_user.id)
    
    if item_type:
        query = query.filter(Favorite.item_type == item_type)
    
    favorites = query.order_by(Favorite.created_at.desc()).all()
    return favorites

@router.post("/", response_model=FavoriteSchema)
async def add_favorite(
    favorite_data: FavoriteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add an item to favorites"""
    # Check if already favorited
    existing = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.item_type == favorite_data.item_type,
        Favorite.item_id == favorite_data.item_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Item already in favorites")
    
    favorite = Favorite(
        user_id=current_user.id,
        **favorite_data.dict()
    )
    db.add(favorite)
    db.commit()
    db.refresh(favorite)
    
    return favorite

@router.delete("/{favorite_id}")
async def remove_favorite(
    favorite_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove an item from favorites"""
    favorite = db.query(Favorite).filter(
        Favorite.id == favorite_id,
        Favorite.user_id == current_user.id
    ).first()
    
    if not favorite:
        raise HTTPException(status_code=404, detail="Favorite not found")
    
    db.delete(favorite)
    db.commit()
    
    return {"message": "Removed from favorites"}

@router.get("/check/{item_type}/{item_id}")
async def check_favorite(
    item_type: str,
    item_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Check if an item is favorited"""
    favorite = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.item_type == item_type,
        Favorite.item_id == item_id
    ).first()
    
    return {"is_favorited": favorite is not None, "favorite_id": favorite.id if favorite else None}
