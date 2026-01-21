from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client
from dotenv import load_dotenv
import os
import logging
import socketio

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


latest_card = {"id": None}

FRONTEND_URL = os.getenv("FRONTEND_URL")
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
        return {"exists": True, "data": result.data}
    else:
        return {"exists": False}


@fastapi_app.post("/submit")
def submit_data(data: ProfilData):
    logging.info("Submitting profile for card: %s", data.card_id)
    latest_card["id"] = data.card_id
    supabase.table("CreaLab_visitors").insert({
        "id_card": data.card_id,
        "first_name": data.prenom,
        "last_name": data.nom,
        "email": data.email
    }).execute()
    return {"message": f"Card {data.card_id} received successfully"}

@fastapi_app.post("/update-profile")
def update_profile(data: ProfilData):
    logging.info("Updating profile for card: %s", data.card_id)
    supabase.table("CreaLab_visitors").update({
        "first_name": data.prenom,
        "last_name": data.nom,
        "email": data.email
    }).eq("id_card", data.card_id).execute()
    return {"message": f"Profile for card {data.card_id} updated successfully"}

@fastapi_app.get("/get-profile/{card_id}")
def get_profile(card_id: str):
    result = supabase.table("CreaLab_visitors").select("*").eq("id_card", card_id).execute()
    if len(result.data) > 0:
        return {"found": True, "data": result.data[0]}
    else:
        return {"found": False}


# Wrap FastAPI app with Socket.IO ASGI app so uvicorn can serve both
asgi_app = socketio.ASGIApp(sio, other_asgi_app=fastapi_app)

# Export top-level `app` for uvicorn
app = asgi_app