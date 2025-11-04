from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime

from mongodb_models import Favorite, User
from mongodb_auth_utils import get_current_user

router = APIRouter()

from pydantic import BaseModel

class FavoriteCreate(BaseModel):
    item_type: str
    item_id: str

@router.post("/")
async def add_favorite(favorite_data: FavoriteCreate, current_user: User = Depends(get_current_user)):
    # Check if already favorited
    existing = await Favorite.find_one({
        "user_id": str(current_user.id),
        "item_type": favorite_data.item_type,
        "item_id": favorite_data.item_id
    })
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Item already in favorites"
        )
    
    favorite = Favorite(
        user_id=str(current_user.id),
        item_type=favorite_data.item_type,
        item_id=favorite_data.item_id,
        created_at=datetime.utcnow()
    )
    await favorite.insert()
    
    return {"message": "Added to favorites", "id": str(favorite.id)}

@router.delete("/{favorite_id}")
async def remove_favorite(favorite_id: str, current_user: User = Depends(get_current_user)):
    favorite = await Favorite.get(favorite_id)
    
    if not favorite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Favorite not found"
        )
    
    if favorite.user_id != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    await favorite.delete()
    return {"message": "Removed from favorites"}

@router.get("/")
async def get_favorites(current_user: User = Depends(get_current_user)):
    favorites = await Favorite.find({"user_id": str(current_user.id)}).to_list()
    return favorites

@router.get("/check/{item_type}/{item_id}")
async def check_favorite(item_type: str, item_id: str, current_user: User = Depends(get_current_user)):
    favorite = await Favorite.find_one({
        "user_id": str(current_user.id),
        "item_type": item_type,
        "item_id": item_id
    })
    
    return {"is_favorite": favorite is not None}
