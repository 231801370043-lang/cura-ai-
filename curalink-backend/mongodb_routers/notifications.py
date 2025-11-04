from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime

from mongodb_models import Notification, User, NotificationType
from mongodb_auth_utils import get_current_user
from pydantic import BaseModel

router = APIRouter()

class VideoCallRequest(BaseModel):
    receiver_id: str
    room_name: str
    
class MessageNotificationRequest(BaseModel):
    receiver_id: str
    message_content: str

@router.post("/")
async def create_notification(
    user_id: str,
    title: str,
    message: str,
    notification_type: NotificationType = NotificationType.INFO,
    action_url: str = None
):
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=notification_type,
        action_url=action_url,
        created_at=datetime.utcnow()
    )
    await notification.insert()
    
    return {"message": "Notification created successfully"}

@router.get("/")
async def get_notifications(current_user: User = Depends(get_current_user)):
    notifications = await Notification.find(
        {"user_id": str(current_user.id)}
    ).sort("-created_at").to_list()
    
    # Convert to dict and ensure ID is included
    result_notifications = []
    for notification in notifications:
        notification_dict = notification.dict()
        notification_dict["id"] = str(notification.id)
        notification_dict["timestamp"] = notification.created_at.isoformat()
        notification_dict["read"] = notification.is_read
        result_notifications.append(notification_dict)
    
    return result_notifications

@router.put("/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user: User = Depends(get_current_user)):
    if notification_id == "undefined" or not notification_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid notification ID"
        )
    
    notification = await Notification.get(notification_id)
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    if notification.user_id != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    notification.is_read = True
    await notification.save()
    
    return {"message": "Notification marked as read"}

@router.put("/mark-all-read")
async def mark_all_notifications_read(current_user: User = Depends(get_current_user)):
    await Notification.find({"user_id": str(current_user.id)}).update({"$set": {"is_read": True}})
    return {"message": "All notifications marked as read"}

@router.delete("/{notification_id}")
async def delete_notification(notification_id: str, current_user: User = Depends(get_current_user)):
    if notification_id == "undefined" or not notification_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid notification ID"
        )
    
    notification = await Notification.get(notification_id)
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    if notification.user_id != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    await notification.delete()
    return {"message": "Notification deleted"}

@router.post("/cleanup")
async def cleanup_invalid_notifications(current_user: User = Depends(get_current_user)):
    """Clean up any notifications that might have invalid data"""
    try:
        # Find all notifications for the user
        notifications = await Notification.find({"user_id": str(current_user.id)}).to_list()
        
        cleaned_count = 0
        for notification in notifications:
            # Check if notification has all required fields
            if not hasattr(notification, 'id') or not notification.id:
                await notification.delete()
                cleaned_count += 1
        
        return {"message": f"Cleaned up {cleaned_count} invalid notifications"}
    except Exception as e:
        return {"message": f"Cleanup completed with some errors: {str(e)}"}

@router.post("/video-call")
async def send_video_call_notification(
    call_request: VideoCallRequest, 
    current_user: User = Depends(get_current_user)
):
    """Send a video call notification to another user"""
    try:
        # Get receiver info
        receiver = await User.get(call_request.receiver_id)
        if not receiver:
            raise HTTPException(status_code=404, detail="Receiver not found")
        
        # Create video call notification
        notification = Notification(
            user_id=call_request.receiver_id,
            title="Incoming Video Call",
            message=f"{current_user.full_name} is calling you",
            type=NotificationType.VIDEO_CALL,
            sender_id=str(current_user.id),
            call_room=call_request.room_name,
            is_read=False,
            created_at=datetime.utcnow()
        )
        await notification.insert()
        
        return {"message": "Video call notification sent", "notification_id": str(notification.id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send video call notification: {str(e)}")

@router.post("/message")
async def send_message_notification(
    message_request: MessageNotificationRequest, 
    current_user: User = Depends(get_current_user)
):
    """Send a message notification to another user"""
    try:
        # Get receiver info
        receiver = await User.get(message_request.receiver_id)
        if not receiver:
            raise HTTPException(status_code=404, detail="Receiver not found")
        
        # Create message notification
        notification = Notification(
            user_id=message_request.receiver_id,
            title="New Message",
            message=f"New message from {current_user.full_name}",
            type=NotificationType.MESSAGE,
            sender_id=str(current_user.id),
            message_content=message_request.message_content[:100] + "..." if len(message_request.message_content) > 100 else message_request.message_content,
            is_read=False,
            created_at=datetime.utcnow()
        )
        await notification.insert()
        
        return {"message": "Message notification sent", "notification_id": str(notification.id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send message notification: {str(e)}")

@router.put("/video-call/{notification_id}/respond")
async def respond_to_video_call(
    notification_id: str,
    response: dict,  # {"action": "accept" or "decline"}
    current_user: User = Depends(get_current_user)
):
    """Respond to a video call notification"""
    try:
        notification = await Notification.get(notification_id)
        if not notification:
            raise HTTPException(status_code=404, detail="Notification not found")
        
        if notification.user_id != str(current_user.id):
            raise HTTPException(status_code=403, detail="Not authorized")
        
        action = response.get("action")
        if action not in ["accept", "decline"]:
            raise HTTPException(status_code=400, detail="Invalid action")
        
        # Mark notification as read
        notification.is_read = True
        await notification.save()
        
        # Send response notification to caller
        caller = await User.get(notification.sender_id)
        if caller:
            if action == "accept":
                # Send special call accepted notification that will auto-open video modal
                response_notification = Notification(
                    user_id=notification.sender_id,
                    title="Call Accepted",
                    message=f"{current_user.full_name} accepted your video call",
                    type=NotificationType.VIDEO_CALL,
                    sender_id=str(current_user.id),
                    call_room=notification.call_room,
                    is_read=False,
                    created_at=datetime.utcnow()
                )
            else:
                # Send decline notification
                response_notification = Notification(
                    user_id=notification.sender_id,
                    title="Call Declined",
                    message=f"{current_user.full_name} declined your video call",
                    type=NotificationType.INFO,
                    is_read=False,
                    created_at=datetime.utcnow()
                )
            await response_notification.insert()
        
        return {
            "message": f"Call {action}d successfully",
            "action": action,
            "room_name": notification.call_room if action == "accept" else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to respond to call: {str(e)}")
