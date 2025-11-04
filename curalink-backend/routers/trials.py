from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from auth_utils import get_current_user
from models import User
from services.api_integrations import ClinicalTrialsService
from services.ai_service import ai_service

router = APIRouter()

@router.get("/search")
async def search_trials(
    condition: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    phase: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    max_results: int = Query(20, le=50),
    current_user: User = Depends(get_current_user)
):
    """Search for clinical trials"""
    trials = await ClinicalTrialsService.search_trials(
        condition=condition,
        location=location,
        phase=phase,
        status=status,
        max_results=max_results
    )
    
    # Add AI summaries
    for trial in trials:
        if trial.get("summary"):
            trial["ai_summary"] = await ai_service.summarize_clinical_trial(
                trial.get("title", ""),
                trial.get("summary", ""),
                trial.get("detailed_description", "")
            )
    
    return {"trials": trials, "count": len(trials)}

@router.get("/{nct_id}")
async def get_trial_details(
    nct_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get detailed information about a specific trial"""
    trials = await ClinicalTrialsService.search_trials(max_results=1)
    
    # In a real implementation, you'd fetch by NCT ID
    # For now, return first result as example
    if trials:
        trial = trials[0]
        trial["ai_summary"] = await ai_service.summarize_clinical_trial(
            trial.get("title", ""),
            trial.get("summary", ""),
            trial.get("detailed_description", "")
        )
        return trial
    
    return {"error": "Trial not found"}
