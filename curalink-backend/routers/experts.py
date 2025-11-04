from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from database import get_db
from auth_utils import get_current_user
from models import User, ResearcherProfile
from services.api_integrations import ORCIDService
from services.ai_service import ai_service

router = APIRouter()

@router.get("/search")
async def search_experts(
    query: Optional[str] = Query(None),
    specialty: Optional[str] = Query(None),
    condition: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Search for health experts and researchers"""
    
    # Search local database
    db_query = db.query(User, ResearcherProfile).join(ResearcherProfile)
    
    if specialty:
        db_query = db_query.filter(ResearcherProfile.specialty.contains(specialty))
    
    if query:
        db_query = db_query.filter(
            (User.full_name.contains(query)) |
            (ResearcherProfile.research_interests.contains(query))
        )
    
    local_results = db_query.limit(10).all()
    
    experts = []
    for user, profile in local_results:
        experts.append({
            "id": user.id,
            "source": "local",
            "full_name": user.full_name,
            "email": user.email,
            "specialty": profile.specialty,
            "research_interests": profile.research_interests,
            "institution": profile.institution,
            "orcid_id": profile.orcid_id,
            "verified": profile.verified,
            "available_for_meetings": profile.available_for_meetings
        })
    
    # Search ORCID if query provided
    if query:
        orcid_results = await ORCIDService.search_researchers(query, max_results=10)
        for researcher in orcid_results:
            experts.append({
                "source": "orcid",
                "full_name": researcher.get("name", ""),
                "institution": researcher.get("institution", ""),
                "orcid_id": researcher.get("orcid_id", ""),
                "specialty": "Research",
                "verified": True
            })
    
    # Use AI to rank experts if condition provided
    if condition and experts:
        experts = await ai_service.recommend_experts(condition, experts)
    
    return {"experts": experts, "count": len(experts)}

@router.get("/{expert_id}")
async def get_expert_details(
    expert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get detailed information about a specific expert"""
    user = db.query(User).filter(User.id == expert_id).first()
    if not user or user.role != "researcher":
        return {"error": "Expert not found"}
    
    profile = db.query(ResearcherProfile).filter(ResearcherProfile.user_id == expert_id).first()
    
    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "specialty": profile.specialty if profile else None,
        "research_interests": profile.research_interests if profile else None,
        "institution": profile.institution if profile else None,
        "orcid_id": profile.orcid_id if profile else None,
        "publications_summary": profile.publications_summary if profile else None,
        "verified": profile.verified if profile else False,
        "available_for_meetings": profile.available_for_meetings if profile else False
    }
