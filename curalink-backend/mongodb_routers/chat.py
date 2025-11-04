from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime
from pydantic import BaseModel

from mongodb_models import ChatMessage, User, Notification, NotificationType
from mongodb_auth_utils import get_current_user

router = APIRouter()

class AIAssistantRequest(BaseModel):
    message: str
    context: str = ""

class MessageCreate(BaseModel):
    receiver_id: str
    message: str

@router.post("/messages")
async def send_message(message_data: MessageCreate, current_user: User = Depends(get_current_user)):
    chat_message = ChatMessage(
        sender_id=str(current_user.id),
        receiver_id=message_data.receiver_id,
        message=message_data.message,
        created_at=datetime.utcnow()
    )
    await chat_message.insert()
    
    # Send message notification to receiver
    try:
        receiver = await User.get(message_data.receiver_id)
        if receiver:
            notification = Notification(
                user_id=message_data.receiver_id,
                title="New Message",
                message=f"New message from {current_user.full_name}",
                type=NotificationType.MESSAGE,
                sender_id=str(current_user.id),
                message_content=message_data.message[:100] + "..." if len(message_data.message) > 100 else message_data.message,
                is_read=False,
                created_at=datetime.utcnow()
            )
            await notification.insert()
    except Exception as e:
        print(f"Failed to send message notification: {e}")
    
    return {
        "id": str(chat_message.id),
        "sender_id": str(current_user.id),
        "sender_name": current_user.full_name,
        "message": chat_message.message,
        "created_at": chat_message.created_at.isoformat()
    }

@router.get("/messages/{other_user_id}")
async def get_messages(other_user_id: str, current_user: User = Depends(get_current_user)):
    # Get the other user to include their name
    other_user = await User.get(other_user_id)
    
    messages = await ChatMessage.find({
        "$or": [
            {"sender_id": str(current_user.id), "receiver_id": other_user_id},
            {"sender_id": other_user_id, "receiver_id": str(current_user.id)}
        ]
    }).sort("created_at").to_list()
    
    # Format messages with sender names
    formatted_messages = []
    for msg in messages:
        sender_name = current_user.full_name if msg.sender_id == str(current_user.id) else (other_user.full_name if other_user else "Unknown")
        formatted_messages.append({
            "id": str(msg.id),
            "sender_id": msg.sender_id,
            "sender_name": sender_name,
            "message": msg.message,
            "created_at": msg.created_at.isoformat()
        })
    
    return formatted_messages

@router.get("/")
async def get_user_messages(current_user: User = Depends(get_current_user)):
    messages = await ChatMessage.find({
        "$or": [
            {"sender_id": str(current_user.id)},
            {"receiver_id": str(current_user.id)}
        ]
    }).sort("created_at").to_list()
    
    return messages

@router.post("/ai-assistant")
async def chat_with_ai_assistant(request: AIAssistantRequest, current_user: User = Depends(get_current_user)):
    """AI Assistant endpoint for CuraAI chat"""
    import os
    import httpx
    
    # Get SambaNova API key from environment
    api_key = os.getenv("SAMBANOVA_API_KEY")
    
    try:
        if api_key:
            # Use SambaNova API for intelligent responses
            async with httpx.AsyncClient() as client:
                prompt = f"""You are CuraAI, a helpful medical research assistant. Provide accurate, helpful information about clinical trials, treatments, and medical research.

User Context: {request.context}
User Question: {request.message}

Please provide a helpful, informative response. Keep it concise but thorough. Always recommend consulting healthcare professionals for medical decisions."""

                response = await client.post(
                    "https://api.sambanova.ai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "Meta-Llama-3.1-8B-Instruct",
                        "messages": [
                            {"role": "system", "content": "You are CuraAI, a helpful medical research assistant."},
                            {"role": "user", "content": prompt}
                        ],
                        "temperature": 0.7,
                        "max_tokens": 500
                    },
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    result = response.json()
                    ai_response = result["choices"][0]["message"]["content"]
                    return {"response": ai_response}
    except Exception as e:
        print(f"SambaNova API error: {e}")
    
    # Fallback to simple responses
    user_message = request.message.lower()
    context = request.context.lower()
    
    # Generate contextual responses
    if "trial" in user_message or "clinical trial" in user_message:
        response = f"Based on your condition ({context}), I found several relevant clinical trials. Here are some key points to consider:\n\n• Look for trials in Phase II or III for more established treatments\n• Check eligibility criteria carefully\n• Consider location and travel requirements\n• Discuss with your doctor before applying\n\nWould you like me to help you understand specific trial details?"
    
    elif "treatment" in user_message or "therapy" in user_message:
        response = f"For {context}, current treatment approaches may include:\n\n• Standard care protocols\n• Emerging therapies in clinical trials\n• Combination treatments\n• Supportive care options\n\nI recommend discussing these options with your healthcare team. Would you like information about specific treatments?"
    
    elif "side effect" in user_message or "symptom" in user_message:
        response = "Managing side effects is crucial for treatment success. Common strategies include:\n\n• Monitoring and reporting symptoms promptly\n• Preventive medications when available\n• Lifestyle modifications\n• Support from healthcare team\n\nPlease consult your doctor for personalized advice about any symptoms you're experiencing."
    
    elif "research" in user_message or "publication" in user_message:
        response = f"I can help you find relevant research about {context}. Key areas to explore:\n\n• Recent publications in peer-reviewed journals\n• Clinical trial results\n• Treatment guidelines\n• Expert opinions\n\nWould you like me to suggest specific research topics or help interpret study findings?"
    
    elif "expert" in user_message or "doctor" in user_message:
        response = f"Finding the right expert for {context} is important. Consider:\n\n• Specialists in your specific condition\n• Researchers with relevant experience\n• Doctors at academic medical centers\n• Second opinion consultations\n\nI can help you identify experts in our network who specialize in your area of interest."
    
    else:
        response = f"I'm CuraAI, your medical research assistant. I can help you with:\n\n• Finding relevant clinical trials\n• Understanding treatment options\n• Locating research publications\n• Connecting with medical experts\n• Interpreting medical information\n\nWhat specific aspect of {context} would you like to explore?"
    
    return {
        "response": response,
        "timestamp": datetime.utcnow().isoformat(),
        "context": context
    }
