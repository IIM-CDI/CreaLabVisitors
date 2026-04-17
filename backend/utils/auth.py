from datetime import datetime


ALLOWED_SCHOOL_EMAIL_DOMAINS = ("@devinci.fr", "@edu.vinci.fr")


def validate_origin(request, frontend_url=None):
    origin = request.headers.get("origin") or request.client.host
    if frontend_url and frontend_url not in origin and origin != "http://localhost":
        from fastapi import HTTPException, status

        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Origine non autorisée")


def validate_card_context(latest_card, card_id: str, max_age_seconds: int = 300):
    from fastapi import HTTPException, status

    if latest_card.get("id") != card_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Carte non récemment scannée")

    timestamp = latest_card.get("ts")
    if not timestamp or (datetime.utcnow() - timestamp).total_seconds() > max_age_seconds:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Scan de carte expiré (5 minutes max)")


def is_school_email(email_value: str) -> bool:
    normalized_email = email_value.strip().lower()
    return normalized_email.endswith(ALLOWED_SCHOOL_EMAIL_DOMAINS)
