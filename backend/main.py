from fastapi import FastAPI, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client
from dotenv import load_dotenv
import os
import logging
import socketio
import jwt
from datetime import datetime, timedelta

load_dotenv()

logging.basicConfig(level=logging.INFO)

fastapi_app = FastAPI()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CardData(BaseModel):
    card_id: str


class ProfilData(BaseModel):
    card_id: str
    prenom: str
    nom: str
    email: str


latest_card = {"id": None, "ts": None}

FRONTEND_URL = os.getenv("FRONTEND_URL")

# JWT settings
SECRET_KEY = os.getenv("SECRET_KEY", "change_this_secret")
TOKEN_EXPIRE_SECONDS = int(os.getenv("TOKEN_EXPIRE_SECONDS", "3600"))

sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins=[FRONTEND_URL] if FRONTEND_URL else "*")


@fastapi_app.get("/")
def read_root():
    return {"Hello": "World"}


@fastapi_app.get("/health")
def health_check():
    return {"status": "healthy"}


@fastapi_app.get("/latest-card")
def get_latest_card():
    return latest_card


@fastapi_app.post("/getCard")
async def get_card(card_data: CardData):
    logging.info("Card scanned: %s", card_data.card_id)
    latest_card["id"] = card_data.card_id
    latest_card["ts"] = datetime.utcnow()
    try:
        await sio.emit("card_scanned", card_data.card_id)
    except Exception:
        logging.exception("Failed to emit socket event for scanned card")
    return {"message": f"Card {card_data.card_id} received successfully"}


@fastapi_app.get("/check-card/{card_id}")
def check_existing_card(card_id: str):
    result = supabase.table("CreaLab_visitors").select("*").eq("id_card", card_id).execute()
    exists = len(result.data) > 0
    if exists:
        # create a short-lived JWT for this card
        payload = {
            "card_id": card_id,
            "exp": datetime.utcnow() + timedelta(seconds=TOKEN_EXPIRE_SECONDS)
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
        return {"exists": True, "data": result.data, "token": token}
    else:
        return {"exists": False}


@fastapi_app.post("/submit")
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
        "email": data.email
    }).execute()
    return {"message": f"Card {data.card_id} received successfully"}

@fastapi_app.post("/update-profile")
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
        "email": data.email
    }).eq("id_card", data.card_id).execute()
    return {"message": f"Profile for card {data.card_id} updated successfully"}

@fastapi_app.get("/get-profile/{card_id}")
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


# Wrap FastAPI app with Socket.IO ASGI app so uvicorn can serve both
asgi_app = socketio.ASGIApp(sio, other_asgi_app=fastapi_app)

# Export top-level `app` for uvicorn
app = asgi_app