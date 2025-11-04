from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from auth_utils import get_current_user
from models import User, ChatMessage
from schemas import ChatMessage as ChatMessageSchema, ChatMessageCreate
from websocket_manager import manager
from services.ai_service import ai_service
import json

router = APIRouter()

@router.get("/conversations")
async def get_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all conversations for the current user"""
    # Get unique users the current user has chatted with
    sent_to = db.query(ChatMessage.receiver_id).filter(
        ChatMessage.sender_id == current_user.id
    ).distinct().all()
    
    received_from = db.query(ChatMessage.sender_id).filter(
        ChatMessage.receiver_id == current_user.id
    ).distinct().all()
    
    user_ids = set([u[0] for u in sent_to] + [u[0] for u in received_from])
    
    conversations = []
    for user_id in user_ids:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            # Get last message
            last_message = db.query(ChatMessage).filter(
                ((ChatMessage.sender_id == current_user.id) & (ChatMessage.receiver_id == user_id)) |
                ((ChatMessage.sender_id == user_id) & (ChatMessage.receiver_id == current_user.id))
            ).order_by(ChatMessage.created_at.desc()).first()
            
            # Count unread messages
            unread_count = db.query(ChatMessage).filter(
                ChatMessage.sender_id == user_id,
                ChatMessage.receiver_id == current_user.id,
                ChatMessage.read == False
            ).count()
            
            conversations.append({
                "user": {
                    "id": user.id,
                    "full_name": user.full_name,
                    "role": user.role
                },
                "last_message": {
                    "message": last_message.message,
                    "created_at": last_message.created_at
                } if last_message else None,
                "unread_count": unread_count
            })
    
    return conversations

@router.get("/messages/{other_user_id}")
async def get_messages(
    other_user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all messages between current user and another user"""
    messages = db.query(ChatMessage).filter(
        ((ChatMessage.sender_id == current_user.id) & (ChatMessage.receiver_id == other_user_id)) |
        ((ChatMessage.sender_id == other_user_id) & (ChatMessage.receiver_id == current_user.id))
    ).order_by(ChatMessage.created_at.asc()).all()
    
    # Mark messages as read
    db.query(ChatMessage).filter(
        ChatMessage.sender_id == other_user_id,
        ChatMessage.receiver_id == current_user.id,
        ChatMessage.read == False
    ).update({"read": True})
    db.commit()
    
    return [{
        "id": msg.id,
        "sender_id": msg.sender_id,
        "receiver_id": msg.receiver_id,
        "message": msg.message,
        "read": msg.read,
        "created_at": msg.created_at
    } for msg in messages]

@router.post("/messages", response_model=ChatMessageSchema)
async def send_message(
    message_data: ChatMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send a message to another user"""
    message = ChatMessage(
        sender_id=current_user.id,
        receiver_id=message_data.receiver_id,
        message=message_data.message
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    
    # Send via WebSocket
    await manager.send_personal_message(
        str(message_data.receiver_id),
        json.dumps({
            "type": "chat_message",
            "message": {
                "id": message.id,
                "sender_id": current_user.id,
                "sender_name": current_user.full_name,
                "message": message.message,
                "created_at": message.created_at.isoformat()
            }
        })
    )
    
    return message

@router.post("/ai-assistant")
async def chat_with_ai(
    query: dict,
    current_user: User = Depends(get_current_user)
):
    """Chat with Cura AI assistant"""
    user_message = query.get("message", "")
    context = query.get("context", "")
    
    response = await ai_service.chat_query(user_message, context)
    
    return {
        "response": response,
        "timestamp": "now"
    }

@router.post("/test-api")
async def test_sambanova_api():
    """Test SambaNova API directly"""
    try:
        response = await ai_service._make_request([
            {"role": "user", "content": "Hello, can you respond with 'API is working correctly'?"}
        ])
        return {
            "status": "success",
            "response": response,
            "api_key_present": bool(ai_service.api_key)
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "api_key_present": bool(ai_service.api_key)
        }
