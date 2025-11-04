from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime

from mongodb_models import Trial, User
from mongodb_schemas import TrialCreate, TrialResponse
from mongodb_auth_utils import get_current_user

router = APIRouter()

@router.post("/", response_model=TrialResponse)
async def create_trial(trial_data: TrialCreate, current_user: User = Depends(get_current_user)):
    trial = Trial(
        **trial_data.dict(),
        created_by=str(current_user.id),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    await trial.insert()
    
    return TrialResponse(
        id=str(trial.id),
        **trial_data.dict(),
        created_by=str(current_user.id),
        created_at=trial.created_at,
        updated_at=trial.updated_at
    )

@router.get("/", response_model=List[TrialResponse])
async def get_trials(skip: int = 0, limit: int = 10):
    # Only return real trials created by users - no demo data
    trials = await Trial.find_all().skip(skip).limit(limit).to_list()
    
    return [
        TrialResponse(
            id=str(trial.id),
            title=trial.title,
            description=trial.description,
            phase=trial.phase,
            status=trial.status,
            condition=trial.condition,
            intervention=trial.intervention,
            sponsor=trial.sponsor,
            location=trial.location,
            eligibility_criteria=trial.eligibility_criteria,
            primary_outcome=trial.primary_outcome,
            secondary_outcome=trial.secondary_outcome,
            start_date=trial.start_date,
            completion_date=trial.completion_date,
            nct_number=trial.nct_number,
            created_by=trial.created_by,
            created_at=trial.created_at,
            updated_at=trial.updated_at
        ) for trial in trials
    ]

@router.get("/{trial_id}", response_model=TrialResponse)
async def get_trial(trial_id: str):
    trial = await Trial.get(trial_id)
    if not trial:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trial not found"
        )
    
    return TrialResponse(
        id=str(trial.id),
        title=trial.title,
        description=trial.description,
        phase=trial.phase,
        status=trial.status,
        condition=trial.condition,
        intervention=trial.intervention,
        sponsor=trial.sponsor,
        location=trial.location,
        eligibility_criteria=trial.eligibility_criteria,
        primary_outcome=trial.primary_outcome,
        secondary_outcome=trial.secondary_outcome,
        start_date=trial.start_date,
        completion_date=trial.completion_date,
        nct_number=trial.nct_number,
        created_by=trial.created_by,
        created_at=trial.created_at,
        updated_at=trial.updated_at
    )

@router.get("/search/{query}")
async def search_trials(query: str, skip: int = 0, limit: int = 100):
    # Simple text search - in production you'd want to use MongoDB text search
    trials = await Trial.find(
        {"$or": [
            {"title": {"$regex": query, "$options": "i"}},
            {"description": {"$regex": query, "$options": "i"}},
            {"condition": {"$regex": query, "$options": "i"}},
            {"intervention": {"$regex": query, "$options": "i"}}
        ]}
    ).skip(skip).limit(limit).to_list()
    
    return [
        TrialResponse(
            id=str(trial.id),
            title=trial.title,
            description=trial.description,
            phase=trial.phase,
            status=trial.status,
            condition=trial.condition,
            intervention=trial.intervention,
            sponsor=trial.sponsor,
            location=trial.location,
            eligibility_criteria=trial.eligibility_criteria,
            primary_outcome=trial.primary_outcome,
            secondary_outcome=trial.secondary_outcome,
            start_date=trial.start_date,
            completion_date=trial.completion_date,
            nct_number=trial.nct_number,
            created_by=trial.created_by,
            created_at=trial.created_at,
            updated_at=trial.updated_at
        ) for trial in trials
    ]
