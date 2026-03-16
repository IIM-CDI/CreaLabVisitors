from fastapi import APIRouter, HTTPException, status
from fastapi.responses import RedirectResponse
from models import EventCreate
from services.email_service import email_service
from services.google_calendar_service import sync_validated_event_to_admin_calendar
import jwt
from datetime import datetime, timedelta
import logging
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

supabase = None
sio = None
EMAIL_TOKEN_SECRET = None
FRONTEND_URL = None
BACKEND_URL = None

def init_event_routes(db, socket_io=None, secret_key=None, frontend_url=None):
    global supabase, sio, EMAIL_TOKEN_SECRET, FRONTEND_URL, BACKEND_URL
    supabase = db
    sio = socket_io
    EMAIL_TOKEN_SECRET = secret_key + "_email_salt" if secret_key else os.getenv("SECRET_KEY", "change_this_secret") + "_email_salt"
    FRONTEND_URL = frontend_url or os.getenv("FRONTEND_URL")
    BACKEND_URL = os.getenv("BACKEND_URL")

def generate_email_token(event_id: str, action: str, admin_email: str = "admin@crealab.com", expires_days: int = 7) -> str:
    payload = {
        "event_id": event_id,
        "action": action,
        "admin_email": admin_email,
        "exp": datetime.utcnow() + timedelta(days=expires_days),
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, EMAIL_TOKEN_SECRET, algorithm="HS256")

def validate_email_token(token: str, expected_action: str, expected_event_id: str) -> dict:
    try:
        payload = jwt.decode(token, EMAIL_TOKEN_SECRET, algorithms=["HS256"])
        if payload.get("action") != expected_action or payload.get("event_id") != expected_event_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token invalide")
        return payload
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token invalide ou expiré")

def send_approval_email(event_data: dict) -> bool:
    try:
        admin_email = os.getenv("ADMIN_EMAIL", "admin@crealab.com")
        approve_token = generate_email_token(event_data["id"], "approve", admin_email)
        reject_token = generate_email_token(event_data["id"], "reject", admin_email)
        
        approve_url = f"{BACKEND_URL}/events/{event_data['id']}/approve?token={approve_token}"
        reject_url = f"{BACKEND_URL}/events/{event_data['id']}/reject?token={reject_token}"
        
        return email_service.send_event_approval_email(event_data, approve_url, reject_url)
    except Exception as e:
        logging.error(f"Error sending approval email: {str(e)}")
        return False

def get_user_info_by_card_id(card_id: str) -> tuple:
    """Get user email and name from card_id. Returns (email, name) tuple or (None, None) if not found."""
    try:
        result = supabase.table("CreaLab_visitors").select("email", "first_name", "last_name").eq("id_card", card_id).execute()
        if result.data and len(result.data) > 0:
            user_data = result.data[0]
            email = user_data.get("email")
            first_name = user_data.get("first_name", "")
            last_name = user_data.get("last_name", "")
            name = f"{first_name} {last_name}".strip() or "Utilisateur"
            return email, name
        return None, None
    except Exception as e:
        logging.error(f"Error getting user info for card {card_id}: {str(e)}")
        return None, None

def send_notification_email(event_data: dict, action: str) -> bool:
    """Send acceptance or rejection email to the event creator"""
    try:
        card_id = event_data.get("id_card")
        if not card_id:
            logging.warning("No card_id found for event, cannot send notification email")
            return False
            
        user_email, user_name = get_user_info_by_card_id(card_id)
        if not user_email:
            logging.warning(f"No email found for card {card_id}, cannot send notification email")
            return False
        
        if action == "accept":
            return email_service.send_event_acceptance_email(event_data, user_email, user_name)
        elif action == "reject":
            return email_service.send_event_rejection_email(event_data, user_email, user_name)
        else:
            logging.error(f"Unknown action: {action}")
            return False
            
    except Exception as e:
        logging.error(f"Error sending notification email: {str(e)}")
        return False


def sync_event_to_google_calendar(event_data: dict) -> None:
    try:
        result = sync_validated_event_to_admin_calendar(event_data)
        if result.get("synced"):
            logging.info(f"Google Calendar event created: {result.get('google_event_id')}")
        else:
            logging.info(f"Google Calendar sync skipped: {result.get('reason')}")
    except Exception as calendar_error:
        logging.warning(f"Failed to sync Google Calendar event: {str(calendar_error)}")


@router.post("/events")
async def create_event(event_data: EventCreate):
    logging.info("Creating event: %s", event_data.title)
    
    try:
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
            try:
                email_sent = send_approval_email(result.data[0])
                logging.info(f"Approval email sent: {email_sent}")
            except Exception as email_error:
                logging.warning(f"Failed to send approval email: {str(email_error)}")
            
            try:
                if sio:
                    await sio.emit("events_updated", {"action": "created", "event": result.data[0]})
            except Exception as socket_error:
                logging.warning(f"Failed to emit socket event: {str(socket_error)}")
            
            return {"message": "Événement créé avec succès", "data": result.data[0]}
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Échec de la création de l'événement"
            )
            
    except Exception as e:
        logging.error("Error creating event: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la création de l'événement : {str(e)}"
        )


@router.get("/events")
def get_all_events():
    logging.info("Retrieving all events")
    
    try:
        result = supabase.table("CreaLab_events").select("*").execute()
        
        return {
            "message": "Événements récupérés avec succès",
            "count": len(result.data),
            "data": result.data
        }
        
    except Exception as e:
        logging.error("Error retrieving events: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération des événements : {str(e)}"
        )
        
@router.get("/unaccepted-events")
def get_unaccepted_events():
    logging.info("Retrieving unaccepted events")
    
    try:
        result = supabase.table("CreaLab_events").select("*").eq("accepted", False).execute()
        
        return {
            "message": "Événements non acceptés récupérés avec succès",
            "count": len(result.data),
            "data": result.data
        }
        
    except Exception as e:
        logging.error("Error retrieving unaccepted events: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération des événements non acceptés : {str(e)}"
        )
        
@router.get("/events/{event_id}/approve")
async def approve_event_via_email(event_id: str, token: str):
    logging.info("Approving event via email with ID: %s", event_id)
    
    try:
        validate_email_token(token, "approve", event_id)
        
        event_check = supabase.table("CreaLab_events").select("*").eq("id", event_id).execute()
        if not event_check.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Événement {event_id} introuvable")
        
        event_data = event_check.data[0]
        
        if event_data.get("accepted"):
            message = "Événement déjà approuvé"
        else:
            # Update event as accepted
            supabase.table("CreaLab_events").update({"accepted": True}).eq("id", event_id).execute()
            message = "Événement approuvé avec succès"

            sync_event_to_google_calendar(event_data)
            
            # Send notification email to the event creator
            try:
                email_sent = send_notification_email(event_data, "accept")
                logging.info(f"Acceptance notification email sent: {email_sent}")
            except Exception as email_error:
                logging.warning(f"Failed to send acceptance notification email: {str(email_error)}")
            
            try:
                if sio:
                    await sio.emit("events_updated", {"action": "approved", "event_id": event_id})
            except Exception as socket_error:
                logging.warning(f"Failed to emit socket event: {str(socket_error)}")
        
        if FRONTEND_URL:
            return RedirectResponse(url=f"{FRONTEND_URL}?message={message}&status=success")
        return {"message": message, "status": "success"}
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error approving event: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/events/{event_id}/reject")
async def reject_event_via_email(event_id: str, token: str):
    logging.info("Rejecting event via email with ID: %s", event_id)
    
    try:
        validate_email_token(token, "reject", event_id)
        
        # Get event data before deletion for notification email
        event_check = supabase.table("CreaLab_events").select("*").eq("id", event_id).execute()
        if not event_check.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Événement {event_id} introuvable")
        
        event_data = event_check.data[0]
        
        # Send notification email to the event creator before deletion
        try:
            email_sent = send_notification_email(event_data, "reject")
            logging.info(f"Rejection notification email sent: {email_sent}")
        except Exception as email_error:
            logging.warning(f"Failed to send rejection notification email: {str(email_error)}")
        
        # Delete the event
        result = supabase.table("CreaLab_events").delete().eq("id", event_id).execute()
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Événement {event_id} introuvable"
            )

        message = "Événement rejeté et supprimé avec succès"
        
        try:
            if sio:
                await sio.emit("events_updated", {"action": "rejected", "event_id": event_id})
        except Exception as socket_error:
            logging.warning(f"Failed to emit socket event: {str(socket_error)}")
        
        if FRONTEND_URL:
            return RedirectResponse(url=f"{FRONTEND_URL}?message={message}&status=success")
        return {"message": message, "status": "success"}
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error rejecting event: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/accept-event/{event_id}")
async def accept_event(event_id: str):
    logging.info("Accepting event with ID: %s", event_id)
    
    try:
        # Get event data first for notification email
        event_check = supabase.table("CreaLab_events").select("*").eq("id", event_id).execute()
        if not event_check.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Événement avec l'ID {event_id} introuvable"
            )
        
        event_data = event_check.data[0]
        
        # Update the event as accepted
        result = supabase.table("CreaLab_events").update({
            "accepted": True
        }).eq("id", event_id).execute()
        
        if result.data:
            sync_event_to_google_calendar(event_data)

            # Send notification email to the event creator
            try:
                email_sent = send_notification_email(event_data, "accept")
                logging.info(f"Acceptance notification email sent: {email_sent}")
            except Exception as email_error:
                logging.warning(f"Failed to send acceptance notification email: {str(email_error)}")
            
            try:
                if sio:
                    await sio.emit("events_updated", {"action": "accepted", "event_id": event_id})
            except Exception as socket_error:
                logging.warning(f"Failed to emit socket event: {str(socket_error)}")
            
            return {"message": f"Événement {event_id} accepté avec succès", "data": result.data[0]}
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Événement avec l'ID {event_id} introuvable"
            )
            
    except Exception as e:
        logging.error("Error accepting event: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de l'acceptation de l'événement : {str(e)}"
        )
        
@router.delete("/delete-event/{event_id}")
async def delete_event(event_id: str):
    logging.info("Deleting event with ID: %s", event_id)
    
    try:
        # Get event data before deletion for notification email
        event_check = supabase.table("CreaLab_events").select("*").eq("id", event_id).execute()
        if not event_check.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Événement avec l'ID {event_id} introuvable"
            )
        
        event_data = event_check.data[0]
        
        # Send notification email to the event creator before deletion
        try:
            email_sent = send_notification_email(event_data, "reject")
            logging.info(f"Rejection notification email sent: {email_sent}")
        except Exception as email_error:
            logging.warning(f"Failed to send rejection notification email: {str(email_error)}")
        
        # Delete the event
        result = supabase.table("CreaLab_events").delete().eq("id", event_id).execute()
        
        if result.data:
            try:
                if sio:
                    await sio.emit("events_updated", {"action": "deleted", "event_id": event_id})
            except Exception as socket_error:
                logging.warning(f"Failed to emit socket event: {str(socket_error)}")
            
            return {"message": f"Événement {event_id} supprimé avec succès"}
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Événement avec l'ID {event_id} introuvable"
            )
            
    except Exception as e:
        logging.error("Error deleting event: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la suppression de l'événement : {str(e)}"
        )