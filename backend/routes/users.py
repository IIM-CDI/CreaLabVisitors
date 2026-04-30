from fastapi import APIRouter, Request, HTTPException, status
from models import ProfileData
import logging
import os
from datetime import datetime
from pydantic import BaseModel
from typing import Optional
from uuid import uuid4
from dotenv import load_dotenv
from utils.auth import is_school_email, validate_card_context, validate_origin

load_dotenv()

router = APIRouter()

supabase = None
latest_card = None
FRONTEND_URLS = None
NO_CARD_PLACEHOLDER = "000000"
TEMP_CARD_PREFIX = "TMP-000000-"


class LoginData(BaseModel):
    email: str
    password: str
    scanned_card_id: Optional[str] = None


def _is_temporary_card(card_id: Optional[str]) -> bool:
    if not card_id:
        return True
    return card_id == NO_CARD_PLACEHOLDER or card_id.startswith(TEMP_CARD_PREFIX)


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

    card_id = user.get("id_card")
    scanned_card_id = data.scanned_card_id.strip() if data.scanned_card_id else None

    # If a card is scanned, associate it with the account (optional step to make login faster)
    if scanned_card_id:
        validate_card_context(latest_card, scanned_card_id)

        existing_card = (
            supabase
            .table("CreaLab_visitors")
            .select("email")
            .eq("id_card", scanned_card_id)
            .execute()
        )

        if existing_card.data and existing_card.data[0].get("email") != data.email:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Cette carte est déjà associée à un autre compte"
            )

        supabase.table("CreaLab_visitors").update({"id_card": scanned_card_id}).eq("email", data.email).execute()
        card_id = scanned_card_id
        latest_card["id"] = card_id
        latest_card["ts"] = datetime.utcnow()

    # Allow login even without a valid card - card scanning is optional and used for faster identification
    return {
        "authenticated": True,
        "card_id": card_id
    }


@router.post("/submit")
def submit_data(request: Request, data: ProfileData):
    logging.info("Submitting profile for card: %s", data.card_id)
    validate_origin(request, FRONTEND_URLS)

    existing_email = (
        supabase
        .table("CreaLab_visitors")
        .select("email")
        .eq("email", data.email)
        .execute()
    )
    if existing_email.data:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Un compte existe déjà avec cet email")

    normalized_card_id = data.card_id.strip() if data.card_id else NO_CARD_PLACEHOLDER
    if normalized_card_id == NO_CARD_PLACEHOLDER:
        normalized_card_id = f"{TEMP_CARD_PREFIX}{uuid4().hex[:12]}"
    else:
        validate_card_context(latest_card, normalized_card_id)
        latest_card["id"] = normalized_card_id
        latest_card["ts"] = None

    if not is_school_email(data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Adresse email invalide: domaines autorises @devinci.fr ou @edu.devinci.fr"
        )

    supabase.table("CreaLab_visitors").insert({
        "id_card": normalized_card_id,
        "first_name": data.first_name,
        "last_name": data.last_name,
        "email": data.email,
        "password": data.password,
        "role": data.role.value,
        "admin": False
    }).execute()
    return {"message": f"Carte {normalized_card_id} reçue avec succès"}


@router.post("/update-profile")
def update_profile(request: Request, data: ProfileData):
    logging.info("Updating profile for email: %s", data.email)
    validate_origin(request, FRONTEND_URLS)
    
    # Use email as primary identifier for updating profile
    # This works whether user logged in with card or without
    supabase.table("CreaLab_visitors").update({
        "first_name": data.first_name,
        "last_name": data.last_name,
        "role": data.role.value
    }).eq("email", data.email).execute()
    
    return {"message": f"Profil pour {data.email} mis à jour avec succès"}


@router.get("/get-profile/{card_id}")
def get_profile(request: Request, card_id: str):
    validate_origin(request, FRONTEND_URLS)
    
    # Try to get profile by card_id first (for backward compatibility)
    result = supabase.table("CreaLab_visitors").select("*").eq("id_card", card_id).execute()
    if len(result.data) > 0:
        return {"found": True, "data": result.data[0]}
    else:
        # Fallback: also search by email (card_id could be an email in some cases)
        result = supabase.table("CreaLab_visitors").select("*").eq("email", card_id).execute()
        if len(result.data) > 0:
            return {"found": True, "data": result.data[0]}
        return {"found": False}