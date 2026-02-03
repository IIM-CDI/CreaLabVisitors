from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client
from dotenv import load_dotenv
from routes.health import router as health_router
from routes.cards import router as cards_router, init_card_routes
from routes.users import router as users_router, init_user_routes
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

latest_card = {"id": None, "ts": None, "role": None}
FRONTEND_URL = os.getenv("FRONTEND_URL")
SECRET_KEY = os.getenv("SECRET_KEY", "change_this_secret")
TOKEN_EXPIRE_SECONDS = int(os.getenv("TOKEN_EXPIRE_SECONDS", "3600"))

sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins=[FRONTEND_URL] if FRONTEND_URL else "*")

init_card_routes(supabase, latest_card, sio, SECRET_KEY, TOKEN_EXPIRE_SECONDS, FRONTEND_URL)
init_user_routes(supabase, latest_card, SECRET_KEY, FRONTEND_URL)

fastapi_app.include_router(health_router)
fastapi_app.include_router(cards_router)
fastapi_app.include_router(users_router)

asgi_app = socketio.ASGIApp(sio, other_asgi_app=fastapi_app)
app = asgi_app