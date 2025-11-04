from fastapi import APIRouter, Depends, Query
from typing import Optional

from auth_utils import get_current_user
from models import User
from services.api_integrations import PubMedService
from services.ai_service import ai_service

router = APIRouter()

@router.get("/search")
async def search_publications(
    query: str = Query(..., min_length=1),
    max_results: int = Query(20, le=50),
    current_user: User = Depends(get_current_user)
):
    """Search for medical publications"""
    publications = await PubMedService.search_publications(query, max_results)
    
    # Add AI summaries
    for pub in publications:
        if pub.get("abstract"):
            pub["ai_summary"] = await ai_service.summarize_publication(
                pub.get("title", ""),
                pub.get("abstract", "")
            )
    
    return {"publications": publications, "count": len(publications)}

@router.get("/{pmid}")
async def get_publication_details(
    pmid: str,
    current_user: User = Depends(get_current_user)
):
    """Get detailed information about a specific publication"""
    publications = await PubMedService.search_publications(pmid, max_results=1)
    
    if publications:
        pub = publications[0]
        if pub.get("abstract"):
            pub["ai_summary"] = await ai_service.summarize_publication(
                pub.get("title", ""),
                pub.get("abstract", "")
            )
        return pub
    
    return {"error": "Publication not found"}
