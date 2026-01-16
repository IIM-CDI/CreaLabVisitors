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

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/submit")
def submit_data(card_data: CardData):
    print(f"Card scanned: {card_data.card_id}")
    
    # Save to Supabase
    result = supabase.table("CreaLab_visitors").insert({"id_card": card_data.card_id}).execute()
    
    return {"message": f"Card {card_data.card_id} received successfully", "data": result.data}