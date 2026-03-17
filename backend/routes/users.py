from fastapi import APIRouter, Request, HTTPException, status
from models import ProfileData
import logging
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

supabase = None
latest_card = None
FRONTEND_URL = None


def init_user_routes(db, card_data, frontend_url=None):
    global supabase, latest_card, FRONTEND_URL
    supabase = db
    latest_card = card_data
    FRONTEND_URL = frontend_url or os.getenv("FRONTEND_URL")


@router.post("/submit")
def submit_data(request: Request, data: ProfileData):
    logging.info("Submitting profile for card: %s", data.card_id)
    
    origin = request.headers.get("origin") or request.client.host
    if FRONTEND_URL and FRONTEND_URL not in origin and origin != "http://localhost":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Origine non autorisée")
    if latest_card.get("id") != data.card_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Carte non récemment scannée")
    ts = latest_card.get("ts")
    if not ts or (datetime.utcnow() - ts).total_seconds() > 300:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Scan de carte expiré (5 minutes max)")

    latest_card["id"] = data.card_id
    latest_card["ts"] = None
    supabase.table("CreaLab_visitors").insert({
        "id_card": data.card_id,
        "first_name": data.first_name,
        "last_name": data.last_name,
        "email": data.email,
        "role": data.role.value,
        "admin": False
    }).execute()
    return {"message": f"Carte {data.card_id} reçue avec succès"}


@router.post("/update-profile")
def update_profile(request: Request, data: ProfileData):
    logging.info("Updating profile for card: %s", data.card_id)
    
    origin = request.headers.get("origin") or request.client.host
    if FRONTEND_URL and FRONTEND_URL not in origin and origin != "http://localhost":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Origine non autorisée")
    if latest_card.get("id") != data.card_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Carte non récemment scannée")
    ts = latest_card.get("ts")
    if not ts or (datetime.utcnow() - ts).total_seconds() > 300:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Scan de carte expiré (5 minutes max)")

    supabase.table("CreaLab_visitors").update({
        "first_name": data.first_name,
        "last_name": data.last_name,
        "email": data.email,
        "role": data.role.value
    }).eq("id_card", data.card_id).execute()
    return {"message": f"Profil pour la carte {data.card_id} mis à jour avec succès"}


@router.get("/get-profile/{card_id}")
def get_profile(request: Request, card_id: str):
    origin = request.headers.get("origin") or request.client.host
    if FRONTEND_URL and FRONTEND_URL not in origin and origin != "http://localhost":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Origine non autorisée")
    if latest_card.get("id") != card_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Carte non récemment scannée")
    ts = latest_card.get("ts")
    if not ts or (datetime.utcnow() - ts).total_seconds() > 300:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Scan de carte expiré (5 minutes max)")

    result = supabase.table("CreaLab_visitors").select("*").eq("id_card", card_id).execute()
    if len(result.data) > 0:
        return {"found": True, "data": result.data[0]}
    else:
        return {"found": False}