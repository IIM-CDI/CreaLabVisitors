from fastapi import APIRouter
from models import CardScan, UserRole
import logging
import jwt
from datetime import datetime, timedelta

router = APIRouter()

supabase = None
latest_card = None
sio = None
SECRET_KEY = None
TOKEN_EXPIRE_SECONDS = None
FRONTEND_URL = None


def init_card_routes(db, card_data, socket_io, secret, token_expire, frontend_url):
    global supabase, latest_card, sio, SECRET_KEY, TOKEN_EXPIRE_SECONDS, FRONTEND_URL
    supabase = db
    latest_card = card_data
    sio = socket_io
    SECRET_KEY = secret
    TOKEN_EXPIRE_SECONDS = token_expire
    FRONTEND_URL = frontend_url


@router.get("/latest-card")
def get_latest_card():
    return latest_card


@router.post("/getCard")
async def get_card(card_data: CardScan):
    logging.info("Card scanned: %s", card_data.card_id)
    latest_card["id"] = card_data.card_id
    latest_card["ts"] = datetime.utcnow()
    try:
        await sio.emit("card_scanned", card_data.card_id)
    except Exception:
        logging.exception("Failed to emit socket event for scanned card")
    return {"message": f"Card {card_data.card_id} received successfully"}


@router.get("/check-card/{card_id}")
def check_existing_card(card_id: str):
    result = supabase.table("CreaLab_visitors").select("*").eq("id_card", card_id).execute()
    exists = len(result.data) > 0
    if exists:
        # get user role
        user_role = result.data[0].get("role", UserRole.ETUDIANT.value)
        # create a short-lived JWT for this card
        payload = {
            "card_id": card_id,
            "role": user_role,
            "exp": datetime.utcnow() + timedelta(seconds=TOKEN_EXPIRE_SECONDS)
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
        return {"exists": True, "data": result.data, "token": token}
    else:
        return {"exists": False}