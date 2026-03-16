import logging
import os
from datetime import datetime, timezone
from urllib.parse import quote

import requests
from dotenv import load_dotenv

load_dotenv()


def _is_sync_enabled() -> bool:
    return os.getenv("GOOGLE_CALENDAR_SYNC_ENABLED", "false").lower() == "true"


def _get_invitee_email() -> str | None:
    invitee_email = os.getenv("GOOGLE_CALENDAR_INVITEE_EMAIL", "").strip()
    return invitee_email or None


def _to_iso_datetime(value) -> str:
    if isinstance(value, datetime):
        dt = value
    elif isinstance(value, str):
        normalized = value.replace("Z", "+00:00") if value.endswith("Z") else value
        dt = datetime.fromisoformat(normalized)
    else:
        raise ValueError("Unsupported datetime format")

    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)

    return dt.isoformat()


def _get_access_token() -> str:
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
    refresh_token = os.getenv("GOOGLE_REFRESH_TOKEN")

    if not client_id or not client_secret or not refresh_token:
        raise RuntimeError("Google Calendar env vars are missing")

    response = requests.post(
        "https://oauth2.googleapis.com/token",
        data={
            "client_id": client_id,
            "client_secret": client_secret,
            "refresh_token": refresh_token,
            "grant_type": "refresh_token",
        },
        timeout=10,
    )
    response.raise_for_status()

    token = response.json().get("access_token")
    if not token:
        raise RuntimeError("Unable to retrieve Google access token")
    return token


def sync_validated_event_to_admin_calendar(event_data: dict) -> dict:
    if not _is_sync_enabled():
        return {"synced": False, "reason": "disabled"}

    calendar_id = os.getenv("GOOGLE_CALENDAR_ID", "primary")
    timezone_name = os.getenv("GOOGLE_CALENDAR_TIMEZONE", "Europe/Paris")

    payload = {
        "summary": event_data.get("title", "Événement CreaLab"),
        "description": (
            f"Créé par: {event_data.get('user', 'Utilisateur inconnu')}\\n"
            f"Référence: {event_data.get('id', 'N/A')}"
        ),
        "start": {
            "dateTime": _to_iso_datetime(event_data.get("start")),
            "timeZone": timezone_name,
        },
        "end": {
            "dateTime": _to_iso_datetime(event_data.get("end")),
            "timeZone": timezone_name,
        },
    }

    invitee_email = _get_invitee_email()
    if invitee_email:
        payload["attendees"] = [{"email": invitee_email}]

    access_token = _get_access_token()
    calendar_path = quote(calendar_id, safe="")
    response = requests.post(
        f"https://www.googleapis.com/calendar/v3/calendars/{calendar_path}/events",
        params={"sendUpdates": "all" if invitee_email else "none"},
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=10,
    )
    response.raise_for_status()

    data = response.json()
    google_event_id = data.get("id")
    logging.info("Google Calendar sync success for event %s", event_data.get("id"))
    return {"synced": True, "google_event_id": google_event_id}