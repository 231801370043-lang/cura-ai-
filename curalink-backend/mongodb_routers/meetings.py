from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from mongodb_models import Meeting, User, MeetingStatus
from mongodb_auth_utils import get_current_user

router = APIRouter()

class MeetingCreate(BaseModel):
    expert_id: Optional[str] = None
    title: Optional[str] = "Meeting Request"
    message: str
    preferred_date: Optional[str] = None
    meeting_type: Optional[str] = "video"

@router.post("/")
async def create_meeting(
    meeting_data: MeetingCreate,
    current_user: User = Depends(get_current_user)
):
    # Parse preferred date if provided
    scheduled_time = None
    if meeting_data.preferred_date:
        try:
            scheduled_time = datetime.fromisoformat(meeting_data.preferred_date.replace('Z', '+00:00'))
        except:
            scheduled_time = datetime.utcnow()  # Default to now if parsing fails
    else:
        scheduled_time = datetime.utcnow()
    
    participants = []
    if meeting_data.expert_id:
        participants = [meeting_data.expert_id]
    
    meeting = Meeting(
        title=meeting_data.title or "Meeting Request",
        description=meeting_data.message,
        organizer_id=str(current_user.id),
        participants=participants,
        scheduled_time=scheduled_time,
        duration_minutes=60,
        status=MeetingStatus.SCHEDULED,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    await meeting.insert()
    
    # Create notification for the expert
    if meeting_data.expert_id:
        from mongodb_models import Notification
        notification = Notification(
            user_id=meeting_data.expert_id,
            title="New Meeting Request",
            message=f"You have received a meeting request from {current_user.full_name}",
            type="info",
            meeting_id=str(meeting.id),
            is_read=False,
            created_at=datetime.utcnow()
        )
        await notification.insert()
    
    return {"message": "Meeting request sent successfully", "meeting_id": str(meeting.id)}

@router.get("/")
async def get_meetings(current_user: User = Depends(get_current_user)):
    meetings = await Meeting.find({
        "$or": [
            {"organizer_id": str(current_user.id)},
            {"participants": str(current_user.id)}
        ]
    }).to_list()
    
    # Populate organizer and participant information
    result_meetings = []
    for meeting in meetings:
        meeting_dict = meeting.dict()
        
        # Ensure ID is properly formatted as string
        meeting_dict["id"] = str(meeting.id)
        meeting_dict["_id"] = str(meeting.id)  # Add both for compatibility
        
        # Add organizer information
        if meeting.organizer_id:
            organizer = await User.get(meeting.organizer_id)
            if organizer:
                meeting_dict["organizer"] = {
                    "id": str(organizer.id),
                    "full_name": organizer.full_name,
                    "email": organizer.email
                }
        
        # Add participant information
        populated_participants = []
        for participant_id in meeting.participants:
            participant = await User.get(participant_id)
            if participant:
                populated_participants.append({
                    "id": str(participant.id),
                    "full_name": participant.full_name,
                    "email": participant.email
                })
        meeting_dict["populated_participants"] = populated_participants
        
        result_meetings.append(meeting_dict)
    
    return result_meetings

@router.get("/{meeting_id}")
async def get_meeting(meeting_id: str, current_user: User = Depends(get_current_user)):
    meeting = await Meeting.get(meeting_id)
    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meeting not found"
        )
    
    # Check if user has access to this meeting
    if (meeting.organizer_id != str(current_user.id) and 
        str(current_user.id) not in meeting.participants):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return meeting

@router.put("/{meeting_id}/status")
async def update_meeting_status(
    meeting_id: str, 
    status_data: dict, 
    current_user: User = Depends(get_current_user)
):
    print(f"Updating meeting status - ID: {meeting_id}, Status: {status_data}")
    
    if meeting_id in ["undefined", "NaN", "[object Object]"] or not meeting_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid meeting ID"
        )
    
    try:
        meeting = await Meeting.get(meeting_id)
    except Exception as e:
        print(f"Error retrieving meeting {meeting_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Meeting not found: {str(e)}"
        )
    
    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meeting not found"
        )
    
    # Check if user is the expert (participant) who can accept/decline
    if str(current_user.id) not in meeting.participants:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the expert can accept or decline this meeting"
        )
    
    # Update meeting status
    new_status = status_data.get("status")
    if new_status == "accepted":
        meeting.status = MeetingStatus.SCHEDULED
    elif new_status == "rejected":
        meeting.status = MeetingStatus.CANCELLED
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status. Use 'accepted' or 'rejected'"
        )
    
    meeting.updated_at = datetime.utcnow()
    await meeting.save()
    
    # Create notification for the patient
    from mongodb_models import Notification
    notification = Notification(
        user_id=meeting.organizer_id,
        title=f"Meeting Request {new_status.title()}",
        message=f"Your meeting request has been {new_status} by {current_user.full_name}",
        type="success" if new_status == "accepted" else "warning",
        meeting_id=str(meeting.id),
        is_read=False,
        created_at=datetime.utcnow()
    )
    await notification.insert()
    
    return {"message": f"Meeting {new_status} successfully"}

@router.delete("/{meeting_id}")
async def delete_meeting(meeting_id: str, current_user: User = Depends(get_current_user)):
    print(f"Deleting meeting - ID: {meeting_id}")
    
    if meeting_id in ["undefined", "NaN", "[object Object]"] or not meeting_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid meeting ID"
        )
    
    meeting = await Meeting.get(meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    # Only organizer or participants can delete the meeting
    if str(current_user.id) not in [meeting.organizer_id] + meeting.participants:
        raise HTTPException(status_code=403, detail="Only meeting participants can delete this meeting")
    
    await meeting.delete()
    return {"message": "Meeting deleted successfully"}
