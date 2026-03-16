from fastapi import APIRouter
from models import CardScan
import logging
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

supabase = None
latest_card = None
sio = None
FRONTEND_URL = None


def init_card_routes(db, card_data, socket_io, frontend_url=None):
    global supabase, latest_card, sio, FRONTEND_URL
    supabase = db
    latest_card = card_data
    sio = socket_io
    FRONTEND_URL = frontend_url or os.getenv("FRONTEND_URL")


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
    return {"message": f"Carte {card_data.card_id} reçue avec succès"}


@router.get("/check-card/{card_id}")
def check_existing_card(card_id: str):
    result = supabase.table("CreaLab_visitors").select("*").eq("id_card", card_id).execute()
    exists = len(result.data) > 0
    if exists:
        return {"exists": True, "data": result.data}
    else:
        return {"exists": False}