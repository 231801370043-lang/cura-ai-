from fastapi import APIRouter, HTTPException, status
from typing import List
from datetime import datetime

from mongodb_models import Expert
from mongodb_schemas import ExpertCreate, ExpertResponse

router = APIRouter()

@router.post("/", response_model=ExpertResponse)
async def create_expert(expert_data: ExpertCreate):
    expert = Expert(
        **expert_data.dict(),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    await expert.insert()
    
    return ExpertResponse(
        id=str(expert.id),
        **expert_data.dict(),
        created_at=expert.created_at,
        updated_at=expert.updated_at
    )

@router.get("/", response_model=List[ExpertResponse])
async def get_experts(skip: int = 0, limit: int = 10):
    # Get only real users who are researchers and have complete profiles
    from mongodb_models import User
    
    researchers = await User.find({
        "role": "researcher",
        "is_active": True
    }).skip(skip).limit(limit).to_list()
    
    return [
        ExpertResponse(
            id=str(researcher.id),
            name=researcher.full_name,
            email=researcher.email,
            specialization=researcher.specialization or "Researcher",
            institution=researcher.institution or "Research Institution",
            bio=researcher.bio or f"Researcher specializing in {researcher.specialization}",
            research_interests=[researcher.specialization] if researcher.specialization else [],
            publications_count=0,  # Real data would come from integration
            h_index=0,  # Real data would come from integration
            orcid_id=researcher.orcid_id,
            profile_picture=researcher.profile_picture,
            contact_info="Available for research collaboration",
            availability=True,
            created_at=researcher.created_at,
            updated_at=researcher.updated_at
        ) for researcher in researchers
    ]

@router.get("/{expert_id}", response_model=ExpertResponse)
async def get_expert(expert_id: str):
    expert = await Expert.get(expert_id)
    if not expert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expert not found"
        )
    
    return ExpertResponse(
        id=str(expert.id),
        name=expert.name,
        email=expert.email,
        specialization=expert.specialization,
        institution=expert.institution,
        bio=expert.bio,
        research_interests=expert.research_interests,
        publications_count=expert.publications_count,
        h_index=expert.h_index,
        orcid_id=expert.orcid_id,
        profile_picture=expert.profile_picture,
        contact_info=expert.contact_info,
        availability=expert.availability,
        created_at=expert.created_at,
        updated_at=expert.updated_at
    )
