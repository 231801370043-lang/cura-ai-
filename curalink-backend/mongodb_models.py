from beanie import Document, Indexed
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    PATIENT = "patient"
    RESEARCHER = "researcher"
    HEALTHCARE_PROVIDER = "healthcare_provider"
    ADMIN = "admin"

class User(Document):
    email: Indexed(EmailStr, unique=True)
    username: Indexed(str, unique=True)
    full_name: str
    hashed_password: str
    role: UserRole = UserRole.PATIENT
    is_active: bool = True
    is_verified: bool = False
    profile_picture: Optional[str] = None
    bio: Optional[str] = None
    specialization: Optional[str] = None
    institution: Optional[str] = None
    orcid_id: Optional[str] = None
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()
    
    class Settings:
        name = "users"

class Trial(Document):
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
    created_by: Optional[str] = None
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()
    
    class Settings:
        name = "trials"

class Publication(Document):
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
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()
    
    class Settings:
        name = "publications"

class Expert(Document):
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
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()
    
    class Settings:
        name = "experts"

class Forum(Document):
    title: str
    description: str
    category: str
    created_by: str
    is_active: bool = True
    post_count: int = 0
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()
    
    class Settings:
        name = "forums"

class ForumPost(Document):
    forum_id: str
    title: str
    content: str
    author_id: str
    author_name: str
    is_pinned: bool = False
    reply_count: int = 0
    parent_post_id: Optional[str] = None
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()
    
    class Settings:
        name = "forum_posts"

class Favorite(Document):
    user_id: str
    item_type: str  # "trial", "publication", "expert"
    item_id: str
    created_at: datetime = datetime.utcnow()
    
    class Settings:
        name = "favorites"

class ChatMessage(Document):
    sender_id: str
    receiver_id: str
    message: str
    is_read: bool = False
    created_at: datetime = datetime.utcnow()
    
    class Settings:
        name = "chat_messages"

class MeetingStatus(str, Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class Meeting(Document):
    title: str
    description: Optional[str] = None
    organizer_id: str
    participants: List[str] = []
    scheduled_time: datetime
    duration_minutes: int = 60
    meeting_url: Optional[str] = None
    status: MeetingStatus = MeetingStatus.SCHEDULED
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()
    
    class Settings:
        name = "meetings"

class NotificationType(str, Enum):
    INFO = "info"
    WARNING = "warning"
    SUCCESS = "success"
    ERROR = "error"
    VIDEO_CALL = "video_call"
    MESSAGE = "message"

class Notification(Document):
    user_id: str
    title: str
    message: str
    type: NotificationType = NotificationType.INFO
    is_read: bool = False
    action_url: Optional[str] = None
    meeting_id: Optional[str] = None
    sender_id: Optional[str] = None  # For call/message notifications
    call_room: Optional[str] = None  # For video call room name
    message_content: Optional[str] = None  # For message notifications
    created_at: datetime = datetime.utcnow()
    
    class Settings:
        name = "notifications"
