from fastapi import APIRouter, Request, HTTPException, status
from models import ProfileData
import logging
import os
from datetime import datetime
from pydantic import BaseModel
from dotenv import load_dotenv
from utils.auth import is_school_email, validate_card_context, validate_origin

load_dotenv()

router = APIRouter()

supabase = None
latest_card = None
FRONTEND_URLS = None


class LoginData(BaseModel):
    email: str
    password: str


def init_user_routes(db, card_data, frontend_url=None):
    global supabase, latest_card, FRONTEND_URLS
    supabase = db
    latest_card = card_data
    FRONTEND_URLS = frontend_url or [
        os.getenv("FRONTEND_URL"),
        os.getenv("FRONTEND_URL_DEPLOYED")
    ]


@router.post("/login")
def login_user(request: Request, data: LoginData):
    validate_origin(request, FRONTEND_URLS)

    result = (
        supabase
        .table("CreaLab_visitors")
        .select("id_card,password")
        .eq("email", data.email)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Identifiants invalides")

    user = result.data[0]
    if user.get("password") != data.password:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Identifiants invalides")

    latest_card["id"] = user.get("id_card")
    latest_card["ts"] = datetime.utcnow()

    return {
        "authenticated": True,
        "card_id": user.get("id_card")
    }


@router.post("/submit")
def submit_data(request: Request, data: ProfileData):
    logging.info("Submitting profile for card: %s", data.card_id)
    validate_origin(request, FRONTEND_URLS)
    validate_card_context(latest_card, data.card_id)
    if not is_school_email(data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Adresse email invalide: domaines autorises @devinci.fr ou @edu.vinci.fr"
        )

    latest_card["id"] = data.card_id
    latest_card["ts"] = None
    supabase.table("CreaLab_visitors").insert({
        "id_card": data.card_id,
        "first_name": data.first_name,
        "last_name": data.last_name,
        "email": data.email,
        "password": data.password,
        "role": data.role.value,
        "admin": False
    }).execute()
    return {"message": f"Carte {data.card_id} reçue avec succès"}


@router.post("/update-profile")
def update_profile(request: Request, data: ProfileData):
    logging.info("Updating profile for card: %s", data.card_id)
    validate_origin(request, FRONTEND_URLS)
    validate_card_context(latest_card, data.card_id)

    supabase.table("CreaLab_visitors").update({
        "first_name": data.first_name,
        "last_name": data.last_name,
        "email": data.email,
        "role": data.role.value
    }).eq("id_card", data.card_id).execute()
    return {"message": f"Profil pour la carte {data.card_id} mis à jour avec succès"}


@router.get("/get-profile/{card_id}")
def get_profile(request: Request, card_id: str):
    validate_origin(request, FRONTEND_URLS)
    validate_card_context(latest_card, card_id)

    result = supabase.table("CreaLab_visitors").select("*").eq("id_card", card_id).execute()
    if len(result.data) > 0:
        return {"found": True, "data": result.data[0]}
    else:
        return {"found": False}