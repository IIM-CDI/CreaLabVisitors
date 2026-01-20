from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

# Supabase setup
supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CardData(BaseModel):
    card_id: str

# Store latest scanned card for browser console logging
latest_card = {"id": None}

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/latest-card")
def get_latest_card():
    """Get the latest scanned card for console logging"""
    return latest_card

@app.post("/getCard")
def get_card(card_data: CardData):
    print(f"Card scanned: {card_data.card_id}")

    latest_card["id"] = card_data.card_id

    return {"message": f"Card {card_data.card_id} received successfully"}

@app.get("/check-card/{card_id}")
def check_existing_card(card_id: str):
    result = supabase.table("CreaLab_visitors").select("*").eq("id_card", card_id).execute()
    print(result.data)
    exists = len(result.data) > 0
    if exists:
        return {"exists": True, "data": result.data}
    else:
        return {"exists": False}

# @app.post("/submit")
# def submit_data(card_data: CardData):
#     print(f"Card scanned: {card_data.card_id}")
    
#     # Update latest card for browser console
#     latest_card["id"] = card_data.card_id
    
#     # Save to Supabase
#     result = supabase.table("CreaLab_visitors").insert({"id_card": card_data.card_id}).execute()
    
#     return {"message": f"Card {card_data.card_id} received successfully", "data": result.data}