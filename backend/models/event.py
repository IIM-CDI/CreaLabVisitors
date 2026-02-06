from pydantic import BaseModel
from datetime import datetime


class EventCreate(BaseModel):
    """Event creation data"""
    id: str
    title: str
    user: str
    start: datetime
    startStr: str  # Keep original field name for compatibility
    end: datetime  
    endStr: str   # Keep original field name for compatibility
    duration: str
    color: str
    id_card: str  # Keep original field name for compatibility


class Event(EventCreate):
    """Complete event with acceptance status"""
    accepted: bool = False