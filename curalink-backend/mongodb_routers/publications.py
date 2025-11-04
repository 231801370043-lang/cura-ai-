from fastapi import APIRouter, HTTPException, status
from typing import List
from datetime import datetime

from mongodb_models import Publication
from mongodb_schemas import PublicationCreate, PublicationResponse

router = APIRouter()

@router.post("/", response_model=PublicationResponse)
async def create_publication(publication_data: PublicationCreate):
    publication = Publication(
        **publication_data.dict(),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    await publication.insert()
    
    return PublicationResponse(
        id=str(publication.id),
        **publication_data.dict(),
        created_at=publication.created_at,
        updated_at=publication.updated_at
    )

@router.get("/", response_model=List[PublicationResponse])
async def get_publications(skip: int = 0, limit: int = 10):
    # Only return real publications created by users - no demo data
    publications = await Publication.find_all().skip(skip).limit(limit).to_list()
    
    return [
        PublicationResponse(
            id=str(pub.id),
            title=pub.title,
            abstract=pub.abstract,
            authors=pub.authors,
            journal=pub.journal,
            publication_date=pub.publication_date,
            doi=pub.doi,
            pmid=pub.pmid,
            keywords=pub.keywords,
            mesh_terms=pub.mesh_terms,
            citation_count=pub.citation_count,
            impact_factor=pub.impact_factor,
            created_at=pub.created_at,
            updated_at=pub.updated_at
        ) for pub in publications
    ]

@router.get("/{publication_id}", response_model=PublicationResponse)
async def get_publication(publication_id: str):
    publication = await Publication.get(publication_id)
    if not publication:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Publication not found"
        )
    
    return PublicationResponse(
        id=str(publication.id),
        title=publication.title,
        abstract=publication.abstract,
        authors=publication.authors,
        journal=publication.journal,
        publication_date=publication.publication_date,
        doi=publication.doi,
        pmid=publication.pmid,
        keywords=publication.keywords,
        mesh_terms=publication.mesh_terms,
        citation_count=publication.citation_count,
        impact_factor=publication.impact_factor,
        created_at=publication.created_at,
        updated_at=publication.updated_at
    )
