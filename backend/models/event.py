from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class EventCreate(BaseModel):
    id: str
    title: str
    user: str
    email: Optional[str] = None
    start: datetime
    startStr: str
    end: datetime
    endStr: str
    duration: str
    color: str
    id_card: Optional[str] = None


class Event(EventCreate):
    accepted: bool = False