from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from mongodb_models import UserRole

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    role: UserRole

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: str
    is_active: bool = True
    is_verified: bool = False
    profile_picture: Optional[str] = None
    bio: Optional[str] = None
    specialization: Optional[str] = None
    institution: Optional[str] = None
    orcid_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Trial Schemas
class TrialBase(BaseModel):
    title: str
    description: str
    phase: Optional[str] = None
    status: str = "recruiting"
    condition: str
    intervention: str
    sponsor: Optional[str] = None
    location: Optional[str] = None
    eligibility_criteria: Optional[str] = None
    primary_outcome: Optional[str] = None
    secondary_outcome: Optional[str] = None
    start_date: Optional[datetime] = None
    completion_date: Optional[datetime] = None
    nct_number: Optional[str] = None

class TrialCreate(TrialBase):
    pass

class TrialResponse(TrialBase):
    id: str
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime

# Publication Schemas
class PublicationBase(BaseModel):
    title: str
    abstract: str
    authors: List[str] = []
    journal: Optional[str] = None
    publication_date: Optional[datetime] = None
    doi: Optional[str] = None
    pmid: Optional[str] = None
    keywords: List[str] = []
    mesh_terms: List[str] = []
    citation_count: int = 0
    impact_factor: Optional[float] = None

class PublicationCreate(PublicationBase):
    pass

class PublicationResponse(PublicationBase):
    id: str
    created_at: datetime
    updated_at: datetime

# Expert Schemas
class ExpertBase(BaseModel):
    name: str
    email: EmailStr
    specialization: str
    institution: str
    bio: Optional[str] = None
    research_interests: List[str] = []
    publications_count: int = 0
    h_index: Optional[int] = None
    orcid_id: Optional[str] = None
    profile_picture: Optional[str] = None
    contact_info: Optional[str] = None
    availability: bool = True

class ExpertCreate(ExpertBase):
    pass

class ExpertResponse(ExpertBase):
    id: str
    created_at: datetime
    updated_at: datetime

# Forum Schemas
class ForumBase(BaseModel):
    title: str
    description: str
    category: str

class ForumCreate(ForumBase):
    pass

class ForumResponse(ForumBase):
    id: str
    created_by: str
    is_active: bool = True
    post_count: int = 0
    created_at: datetime
    updated_at: datetime

# Forum Post Schemas
class ForumPostBase(BaseModel):
    title: str
    content: str

class ForumPostCreate(ForumPostBase):
    forum_id: str
    parent_post_id: Optional[str] = None

class ForumPostResponse(ForumPostBase):
    id: str
    forum_id: str
    author_id: str
    author_name: str
    is_pinned: bool = False
    reply_count: int = 0
    parent_post_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
