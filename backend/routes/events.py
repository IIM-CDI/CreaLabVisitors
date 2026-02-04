from fastapi import APIRouter, HTTPException, status
from models import EventCreateData
import logging

router = APIRouter()

supabase = None

def init_event_routes(db):
    global supabase
    supabase = db


@router.post("/events")
def create_event(event_data: EventCreateData):
    """Create a new event in the database"""
    logging.info("Creating event: %s", event_data.title)
    
    try:
        # Insert event into database
        result = supabase.table("CreaLab_events").insert({
            "id": event_data.id,
            "title": event_data.title,
            "user": event_data.user,
            "start": event_data.start.isoformat(),
            "startStr": event_data.startStr,
            "end": event_data.end.isoformat(),
            "endStr": event_data.endStr,
            "duration": event_data.duration,
            "color": event_data.color,
            "id_card": event_data.id_card,
            "accepted": False
        }).execute()
        
        if result.data:
            return {"message": "Event created successfully", "data": result.data[0]}
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create event"
            )
            
    except Exception as e:
        logging.error("Error creating event: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating event: {str(e)}"
        )


@router.get("/events")
def get_all_events():
    """Retrieve all events from the database"""
    logging.info("Retrieving all events")
    
    try:
        # Get all events from database
        result = supabase.table("CreaLab_events").select("*").execute()
        
        return {
            "message": "Events retrieved successfully",
            "count": len(result.data),
            "data": result.data
        }
        
    except Exception as e:
        logging.error("Error retrieving events: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving events: {str(e)}"
        )
        
@router.get("/unaccepted-events")
def get_unaccepted_events():
    """Retrieve all unaccepted events from the database"""
    logging.info("Retrieving unaccepted events")
    
    try:
        # Get unaccepted events from database
        result = supabase.table("CreaLab_events").select("*").eq("accepted", False).execute()
        
        return {
            "message": "Unaccepted events retrieved successfully",
            "count": len(result.data),
            "data": result.data
        }
        
    except Exception as e:
        logging.error("Error retrieving unaccepted events: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving unaccepted events: {str(e)}"
        )
        
@router.post("/accept-event/{event_id}")
def accept_event(event_id: str):
    """Accept an event by its ID"""
    logging.info("Accepting event with ID: %s", event_id)
    
    try:
        # Update event to accepted in database
        result = supabase.table("CreaLab_events").update({
            "accepted": True
        }).eq("id", event_id).execute()
        
        if result.data:
            return {"message": f"Event {event_id} accepted successfully", "data": result.data[0]}
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Event with ID {event_id} not found"
            )
            
    except Exception as e:
        logging.error("Error accepting event: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error accepting event: {str(e)}"
        )
        
@router.delete("/events/{event_id}")
def delete_event(event_id: str):
    """Delete an event by its ID"""
    logging.info("Deleting event with ID: %s", event_id)
    
    try:
        # Delete event from database
        result = supabase.table("CreaLab_events").delete().eq("id", event_id).execute()
        
        if result.data:
            return {"message": f"Event {event_id} deleted successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Event with ID {event_id} not found"
            )
            
    except Exception as e:
        logging.error("Error deleting event: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting event: {str(e)}"
        )