from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

class UserRole(str, enum.Enum):
    PATIENT = "patient"
    RESEARCHER = "researcher"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    patient_profile = relationship("PatientProfile", back_populates="user", uselist=False)
    researcher_profile = relationship("ResearcherProfile", back_populates="user", uselist=False)
    favorites = relationship("Favorite", back_populates="user")
    forum_posts = relationship("ForumPost", back_populates="author")
    sent_messages = relationship("ChatMessage", foreign_keys="ChatMessage.sender_id", back_populates="sender")
    received_messages = relationship("ChatMessage", foreign_keys="ChatMessage.receiver_id", back_populates="receiver")
    meeting_requests_sent = relationship("MeetingRequest", foreign_keys="MeetingRequest.requester_id", back_populates="requester")
    meeting_requests_received = relationship("MeetingRequest", foreign_keys="MeetingRequest.expert_id", back_populates="expert")
    notifications = relationship("Notification", back_populates="user")

class PatientProfile(Base):
    __tablename__ = "patient_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    medical_condition = Column(String(500))
    location = Column(String(255))
    age = Column(Integer)
    additional_info = Column(Text)
    
    user = relationship("User", back_populates="patient_profile")

class ResearcherProfile(Base):
    __tablename__ = "researcher_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    specialty = Column(String(255))
    research_interests = Column(Text)
    institution = Column(String(255))
    orcid_id = Column(String(100))
    publications_summary = Column(Text)
    available_for_meetings = Column(Boolean, default=True)
    verified = Column(Boolean, default=False)
    
    user = relationship("User", back_populates="researcher_profile")

class Favorite(Base):
    __tablename__ = "favorites"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    item_type = Column(String(50))  # 'trial', 'publication', 'expert'
    item_id = Column(String(255))
    item_data = Column(Text)  # JSON string of the saved item
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="favorites")

class Forum(Base):
    __tablename__ = "forums"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    category = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    posts = relationship("ForumPost", back_populates="forum")

class ForumPost(Base):
    __tablename__ = "forum_posts"
    
    id = Column(Integer, primary_key=True, index=True)
    forum_id = Column(Integer, ForeignKey("forums.id"))
    author_id = Column(Integer, ForeignKey("users.id"))
    parent_id = Column(Integer, ForeignKey("forum_posts.id"), nullable=True)  # For replies
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    forum = relationship("Forum", back_populates="posts")
    author = relationship("User", back_populates="forum_posts")
    replies = relationship("ForumPost", remote_side=[id])

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer, ForeignKey("users.id"))
    message = Column(Text, nullable=False)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="received_messages")

class MeetingRequest(Base):
    __tablename__ = "meeting_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    requester_id = Column(Integer, ForeignKey("users.id"))
    expert_id = Column(Integer, ForeignKey("users.id"))
    message = Column(Text)
    status = Column(String(50), default="pending")  # pending, accepted, rejected
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    requester = relationship("User", foreign_keys=[requester_id], back_populates="meeting_requests_sent")
    expert = relationship("User", foreign_keys=[expert_id], back_populates="meeting_requests_received")

class ClinicalTrial(Base):
    __tablename__ = "clinical_trials"
    
    id = Column(Integer, primary_key=True, index=True)
    nct_id = Column(String(50), unique=True, index=True)
    title = Column(String(500))
    summary = Column(Text)
    ai_summary = Column(Text)
    condition = Column(String(255))
    location = Column(String(255))
    phase = Column(String(50))
    status = Column(String(100))
    sponsor = Column(String(255))
    data = Column(Text)  # Full JSON data
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(String(50))  # 'meeting_request', 'meeting_accepted', 'meeting_declined', 'general'
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    from_user = Column(String(255))  # Name of the user who triggered the notification
    meeting_id = Column(Integer, nullable=True)  # Reference to meeting request if applicable
    read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="notifications")
