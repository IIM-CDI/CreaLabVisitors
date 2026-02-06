from pydantic import BaseModel
from .user import UserRole


class ProfileData(BaseModel):
    card_id: str
    first_name: str
    last_name: str
    email: str
    role: UserRole
    admin: bool = False