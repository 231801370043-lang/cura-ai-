from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from models import UserRole

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

# Patient Profile Schemas
class PatientProfileBase(BaseModel):
    medical_condition: Optional[str] = None
    location: Optional[str] = None
    age: Optional[int] = None
    additional_info: Optional[str] = None

class PatientProfileCreate(PatientProfileBase):
    pass

class PatientProfile(PatientProfileBase):
    id: int
    user_id: int
    
    class Config:
        from_attributes = True

# Researcher Profile Schemas
class ResearcherProfileBase(BaseModel):
    specialty: Optional[str] = None
    research_interests: Optional[str] = None
    institution: Optional[str] = None
    orcid_id: Optional[str] = None
    publications_summary: Optional[str] = None
    available_for_meetings: bool = True

class ResearcherProfileCreate(ResearcherProfileBase):
    pass

class ResearcherProfile(ResearcherProfileBase):
    id: int
    user_id: int
    verified: bool
    
    class Config:
        from_attributes = True

# Favorite Schemas
class FavoriteCreate(BaseModel):
    item_type: str
    item_id: str
    item_data: str

class Favorite(FavoriteCreate):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Forum Schemas
class ForumCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = None

class Forum(ForumCreate):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class ForumPostCreate(BaseModel):
    forum_id: int
    content: str
    parent_id: Optional[int] = None

class ForumPost(ForumPostCreate):
    id: int
    author_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Chat Schemas
class ChatMessageCreate(BaseModel):
    receiver_id: int
    message: str

class ChatMessage(ChatMessageCreate):
    id: int
    sender_id: int
    read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Meeting Request Schemas
class MeetingRequestCreate(BaseModel):
    expert_id: int
    message: Optional[str] = None

class MeetingRequestResponse(BaseModel):
    id: int
    requester_id: int
    expert_id: int
    message: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class MeetingRequest(MeetingRequestCreate):
    id: int
    requester_id: int
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Clinical Trial Schemas
class ClinicalTrialBase(BaseModel):
    nct_id: str
    title: str
    summary: Optional[str] = None
    ai_summary: Optional[str] = None
    condition: Optional[str] = None
    location: Optional[str] = None
    phase: Optional[str] = None
    status: Optional[str] = None
    sponsor: Optional[str] = None
    data: Optional[str] = None

class ClinicalTrial(ClinicalTrialBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Notification Schemas
class NotificationCreate(BaseModel):
    type: str
    title: str
    message: str
    from_user: Optional[str] = None
    meeting_id: Optional[int] = None

class NotificationResponse(BaseModel):
    id: int
    user_id: int
    type: str
    title: str
    message: str
    from_user: Optional[str] = None
    meeting_id: Optional[int] = None
    read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
