from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import User, MeetingRequest
from schemas import MeetingRequestCreate, MeetingRequestResponse
from auth_utils import get_current_user
from routers.notifications import create_meeting_notification
from websocket_manager import manager
import json

router = APIRouter()

@router.get("/", response_model=List[dict])
async def get_meeting_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all meeting requests for the current user"""
    if current_user.role == "patient":
        # Get requests sent by patient
        requests = db.query(MeetingRequest, User).join(
            User, MeetingRequest.expert_id == User.id
        ).filter(MeetingRequest.requester_id == current_user.id).all()
        
        return [{
            "id": req.id,
            "expert": {
                "id": expert.id,
                "full_name": expert.full_name,
                "role": expert.role
            },
            "message": req.message,
            "status": req.status,
            "created_at": req.created_at,
            "type": "sent"
        } for req, expert in requests]
    else:
        # Get requests received by researcher
        requests = db.query(MeetingRequest, User).join(
            User, MeetingRequest.requester_id == User.id
        ).filter(MeetingRequest.expert_id == current_user.id).all()
        
        return [{
            "id": req.id,
            "requester": {
                "id": requester.id,
                "full_name": requester.full_name,
                "role": requester.role
            },
            "message": req.message,
            "status": req.status,
            "created_at": req.created_at,
            "type": "received"
        } for req, requester in requests]

@router.post("/", response_model=MeetingRequestResponse)
async def create_meeting_request(
    request_data: MeetingRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a meeting request"""
    # Check if target user exists
    target_user = db.query(User).filter(User.id == request_data.expert_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Target user not found")
    
    # Prevent self-meetings
    if current_user.id == request_data.expert_id:
        raise HTTPException(status_code=400, detail="Cannot request meeting with yourself")
    
    # Check if request already exists
    existing = db.query(MeetingRequest).filter(
        MeetingRequest.requester_id == current_user.id,
        MeetingRequest.expert_id == request_data.expert_id,
        MeetingRequest.status == "pending"
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Meeting request already pending")
    
    meeting_request = MeetingRequest(
        requester_id=current_user.id,
        expert_id=request_data.expert_id,
        message=request_data.message
    )
    db.add(meeting_request)
    db.commit()
    db.refresh(meeting_request)
    
    # Create notification for the expert
    await create_meeting_notification(
        db=db,
        user_id=str(request_data.expert_id),
        notification_type="meeting_request",
        title="New Meeting Request",
        message=f"{current_user.full_name} has requested a meeting with you",
        from_user=current_user.full_name,
        meeting_id=meeting_request.id
    )
    
    # Send notification via WebSocket
    await manager.send_personal_message(
        str(request_data.expert_id),
        json.dumps({
            "type": "meeting_request",
            "request": {
                "id": meeting_request.id,
                "requester": {
                    "id": current_user.id,
                    "full_name": current_user.full_name,
                    "role": current_user.role
                },
                "message": meeting_request.message,
                "created_at": meeting_request.created_at.isoformat()
            }
        })
    )
    
    return meeting_request

@router.put("/{request_id}/status")
async def update_meeting_status(
    request_id: int,
    status_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update meeting request status (accept/reject)"""
    meeting_request = db.query(MeetingRequest).filter(
        MeetingRequest.id == request_id
    ).first()
    
    if not meeting_request:
        raise HTTPException(status_code=404, detail="Meeting request not found")
    
    # Only expert can update status
    if meeting_request.expert_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the expert can update this request")
    
    new_status = status_data.get("status")
    if new_status not in ["accepted", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    meeting_request.status = new_status
    db.commit()
    
    # Create notification for the requester
    notification_type = "meeting_accepted" if new_status == "accepted" else "meeting_declined"
    notification_title = f"Meeting Request {new_status.title()}"
    notification_message = f"{current_user.full_name} has {new_status} your meeting request"
    
    await create_meeting_notification(
        db=db,
        user_id=str(meeting_request.requester_id),
        notification_type=notification_type,
        title=notification_title,
        message=notification_message,
        from_user=current_user.full_name,
        meeting_id=meeting_request.id
    )
    
    # Notify requester via WebSocket
    await manager.send_personal_message(
        str(meeting_request.requester_id),
        json.dumps({
            "type": "meeting_status_update",
            "request": {
                "id": meeting_request.id,
                "status": new_status,
                "expert": {
                    "id": current_user.id,
                    "full_name": current_user.full_name
                }
            }
        })
    )
    
    return {"message": f"Meeting request {new_status}", "status": new_status}

@router.delete("/{request_id}")
async def cancel_meeting_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cancel a meeting request"""
    meeting_request = db.query(MeetingRequest).filter(
        MeetingRequest.id == request_id,
        MeetingRequest.requester_id == current_user.id
    ).first()
    
    if not meeting_request:
        raise HTTPException(status_code=404, detail="Meeting request not found")
    
    db.delete(meeting_request)
    db.commit()
    
    return {"message": "Meeting request cancelled"}
