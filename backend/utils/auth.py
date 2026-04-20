from datetime import datetime


ALLOWED_SCHOOL_EMAIL_DOMAINS = ("@devinci.fr", "@edu.vinci.fr")


def _normalize_origin(value: str) -> str:
    return value.rstrip("/")


def validate_origin(request, frontend_urls=None):
    origin = request.headers.get("origin")
    if not origin:
        return

    if frontend_urls and isinstance(frontend_urls, str):
        frontend_urls = [frontend_urls]

    if frontend_urls:
        normalized_origin = _normalize_origin(origin)
        allowed_origins = {_normalize_origin(url) for url in frontend_urls if url}
        if normalized_origin not in allowed_origins and normalized_origin != "http://localhost":
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
