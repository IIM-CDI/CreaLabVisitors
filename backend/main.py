from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client
from dotenv import load_dotenv
from routes.health import router as health_router
from routes.cards import router as cards_router, init_card_routes
from routes.users import router as users_router, init_user_routes
from routes.events import router as events_router, init_event_routes
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

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
FRONTEND_URL_DEPLOYED = os.getenv("FRONTEND_URL_DEPLOYED")
ALLOWED_FRONTEND_ORIGINS = [FRONTEND_URL]
if FRONTEND_URL_DEPLOYED and FRONTEND_URL_DEPLOYED not in ALLOWED_FRONTEND_ORIGINS:
    ALLOWED_FRONTEND_ORIGINS.append(FRONTEND_URL_DEPLOYED)

fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

latest_card = {"id": None, "ts": None, "role": None}
SECRET_KEY = os.getenv("SECRET_KEY", "change_this_secret")

sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins=ALLOWED_FRONTEND_ORIGINS)

init_card_routes(supabase, latest_card, sio, ALLOWED_FRONTEND_ORIGINS)
init_user_routes(supabase, latest_card, ALLOWED_FRONTEND_ORIGINS)
init_event_routes(supabase, sio, SECRET_KEY, ALLOWED_FRONTEND_ORIGINS)

fastapi_app.include_router(health_router)
fastapi_app.include_router(cards_router)
fastapi_app.include_router(users_router)
fastapi_app.include_router(events_router)

asgi_app = socketio.ASGIApp(sio, other_asgi_app=fastapi_app)
app = asgi_app