from pydantic import BaseModel
from typing import Optional
from .user import UserRole


class ProfileData(BaseModel):
    card_id: Optional[str] = None
    first_name: str
    last_name: str
    email: str
    password: str
    role: UserRole
    admin: bool = False