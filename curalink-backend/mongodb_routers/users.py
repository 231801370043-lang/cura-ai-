from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime

from mongodb_models import User
from mongodb_schemas import UserResponse
from mongodb_auth_utils import get_current_user

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        username=current_user.username,
        full_name=current_user.full_name,
        role=current_user.role,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        profile_picture=current_user.profile_picture,
        bio=current_user.bio,
        specialization=current_user.specialization,
        institution=current_user.institution,
        orcid_id=current_user.orcid_id,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at
    )

@router.get("/patient-profile")
async def get_patient_profile(current_user: User = Depends(get_current_user)):
    """Get patient profile information"""
    if current_user.role != "patient":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Patient role required."
        )
    
    return {
        "id": str(current_user.id),
        "full_name": current_user.full_name,
        "email": current_user.email,
        "bio": current_user.bio,
        "profile_picture": current_user.profile_picture,
        "created_at": current_user.created_at,
        "updated_at": current_user.updated_at
    }

@router.put("/patient-profile")
async def update_patient_profile(
    medical_condition: Optional[str] = None,
    location: Optional[str] = None,
    age: Optional[int] = None,
    bio: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Update patient profile information"""
    if current_user.role != "patient":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Patient role required."
        )
    
    # Update user fields
    if bio is not None:
        current_user.bio = bio
    
    current_user.updated_at = datetime.utcnow()
    await current_user.save()
    
    return {"message": "Profile updated successfully"}

@router.get("/researcher-profile")
async def get_researcher_profile(current_user: User = Depends(get_current_user)):
    """Get researcher profile information"""
    if current_user.role != "researcher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Researcher role required."
        )
    
    return {
        "id": str(current_user.id),
        "full_name": current_user.full_name,
        "email": current_user.email,
        "specialization": current_user.specialization,
        "institution": current_user.institution,
        "bio": current_user.bio,
        "orcid_id": current_user.orcid_id,
        "profile_picture": current_user.profile_picture,
        "created_at": current_user.created_at,
        "updated_at": current_user.updated_at
    }

@router.put("/researcher-profile")
async def update_researcher_profile(
    specialty: Optional[str] = None,
    research_interests: Optional[str] = None,
    institution: Optional[str] = None,
    orcid_id: Optional[str] = None,
    bio: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Update researcher profile information"""
    if current_user.role != "researcher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Researcher role required."
        )
    
    # Update user fields
    if specialty is not None:
        current_user.specialization = specialty
    if institution is not None:
        current_user.institution = institution
    if orcid_id is not None:
        current_user.orcid_id = orcid_id
    if bio is not None:
        current_user.bio = bio
    
    current_user.updated_at = datetime.utcnow()
    await current_user.save()
    
    return {"message": "Profile updated successfully"}

@router.get("/", response_model=List[UserResponse])
async def get_users(skip: int = 0, limit: int = 100):
    users = await User.find_all().skip(skip).limit(limit).to_list()
    return [
        UserResponse(
            id=str(user.id),
            email=user.email,
            username=user.username,
            full_name=user.full_name,
            role=user.role,
            is_active=user.is_active,
            is_verified=user.is_verified,
            profile_picture=user.profile_picture,
            bio=user.bio,
            specialization=user.specialization,
            institution=user.institution,
            orcid_id=user.orcid_id,
            created_at=user.created_at,
            updated_at=user.updated_at
        ) for user in users
    ]

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str):
    user = await User.get(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(
        id=str(user.id),
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        role=user.role,
        is_active=user.is_active,
        is_verified=user.is_verified,
        profile_picture=user.profile_picture,
        bio=user.bio,
        specialization=user.specialization,
        institution=user.institution,
        orcid_id=user.orcid_id,
        created_at=user.created_at,
        updated_at=user.updated_at
    )
