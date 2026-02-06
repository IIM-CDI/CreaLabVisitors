from pydantic import BaseModel
from datetime import datetime


class EventCreate(BaseModel):
    id: str
    title: str
    user: str
    start: datetime
    startStr: str
    end: datetime
    endStr: str
    duration: str
    color: str
    id_card: str


class Event(EventCreate):
    accepted: bool = False