from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import User, PatientProfile, ResearcherProfile
from schemas import (
    User as UserSchema,
    PatientProfile as PatientProfileSchema,
    PatientProfileCreate,
    ResearcherProfile as ResearcherProfileSchema,
    ResearcherProfileCreate
)
from auth_utils import get_current_user

router = APIRouter()

@router.get("/me", response_model=UserSchema)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/patient-profile", response_model=PatientProfileSchema)
async def get_patient_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Not a patient. Please register as a patient to access this dashboard.")
    
    profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    if not profile:
        # Create a default profile if it doesn't exist
        profile = PatientProfile(
            user_id=current_user.id,
            medical_condition="Not specified",
            location="Not specified"
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@router.put("/patient-profile", response_model=PatientProfileSchema)
async def update_patient_profile(
    profile_data: PatientProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Not a patient")
    
    profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    for key, value in profile_data.dict(exclude_unset=True).items():
        setattr(profile, key, value)
    
    db.commit()
    db.refresh(profile)
    return profile

@router.get("/researcher-profile", response_model=ResearcherProfileSchema)
async def get_researcher_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "researcher":
        raise HTTPException(status_code=403, detail="Not a researcher")
    
    profile = db.query(ResearcherProfile).filter(ResearcherProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.put("/researcher-profile", response_model=ResearcherProfileSchema)
async def update_researcher_profile(
    profile_data: ResearcherProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "researcher":
        raise HTTPException(status_code=403, detail="Not a researcher")
    
    profile = db.query(ResearcherProfile).filter(ResearcherProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    for key, value in profile_data.dict(exclude_unset=True).items():
        setattr(profile, key, value)
    
    db.commit()
    db.refresh(profile)
    return profile

@router.get("/researchers", response_model=List[dict])
async def get_researchers(
    specialty: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(User, ResearcherProfile).join(ResearcherProfile)
    
    if specialty:
        query = query.filter(ResearcherProfile.specialty.contains(specialty))
    
    results = query.all()
    
    researchers = []
    for user, profile in results:
        researchers.append({
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "specialty": profile.specialty,
            "research_interests": profile.research_interests,
            "institution": profile.institution,
            "verified": profile.verified,
            "available_for_meetings": profile.available_for_meetings
        })
    
    return researchers
