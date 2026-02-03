from fastapi import APIRouter, Request, HTTPException, status
from models import ProfilData
import logging
import jwt
from datetime import datetime

router = APIRouter()

supabase = None
latest_card = None
SECRET_KEY = None
FRONTEND_URL = None


def init_user_routes(db, card_data, secret, frontend_url):
    global supabase, latest_card, SECRET_KEY, FRONTEND_URL
    supabase = db
    latest_card = card_data
    SECRET_KEY = secret
    FRONTEND_URL = frontend_url


@router.post("/submit")
def submit_data(request: Request, data: ProfilData):
    logging.info("Submitting profile for card: %s", data.card_id)
    # If Authorization header with valid token is present, accept.
    auth = request.headers.get("authorization")
    if auth:
        try:
            token = auth.split()[1]
            decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            if decoded.get("card_id") != data.card_id:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token card mismatch")
        except Exception:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    else:
        # No token: allow only if the card was very recently scanned by the kiosk frontend
        origin = request.headers.get("origin") or request.client.host
        if FRONTEND_URL and FRONTEND_URL not in origin and origin != "http://localhost":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Origin not allowed")
        if latest_card.get("id") != data.card_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Card not recently scanned")
        ts = latest_card.get("ts")
        if not ts or (datetime.utcnow() - ts).total_seconds() > 120:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Card scan expired")

    latest_card["id"] = data.card_id
    latest_card["ts"] = None
    supabase.table("CreaLab_visitors").insert({
        "id_card": data.card_id,
        "first_name": data.prenom,
        "last_name": data.nom,
        "email": data.email,
        "role": data.role.value
    }).execute()
    return {"message": f"Card {data.card_id} received successfully"}


@router.post("/update-profile")
def update_profile(request: Request, data: ProfilData):
    logging.info("Updating profile for card: %s", data.card_id)
    auth = request.headers.get("authorization")
    if not auth:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing authorization token")
    try:
        token = auth.split()[1]
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        if decoded.get("card_id") != data.card_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token card mismatch")
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    supabase.table("CreaLab_visitors").update({
        "first_name": data.prenom,
        "last_name": data.nom,
        "email": data.email,
        "role": data.role.value
    }).eq("id_card", data.card_id).execute()
    return {"message": f"Profile for card {data.card_id} updated successfully"}


@router.get("/get-profile/{card_id}")
def get_profile(request: Request, card_id: str):
    auth = request.headers.get("authorization")
    if not auth:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing authorization token")
    try:
        token = auth.split()[1]
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        if decoded.get("card_id") != card_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token card mismatch")
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    result = supabase.table("CreaLab_visitors").select("*").eq("id_card", card_id).execute()
    if len(result.data) > 0:
        return {"found": True, "data": result.data[0]}
    else:
        return {"found": False}