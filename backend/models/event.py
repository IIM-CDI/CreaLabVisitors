from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class EventData(BaseModel):
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


class EventCreateData(BaseModel):
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