from pydantic import BaseModel
from typing import Optional
from .user import UserRole


class ProfileData(BaseModel):
    card_id: Optional[str] = None
    first_name: str
    last_name: str
    email: str
    password: Optional[str] = None
    role: UserRole
    admin: bool = False