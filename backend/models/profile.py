from pydantic import BaseModel
from .user import UserRole


class ProfileData(BaseModel):
    """User profile data"""
    card_id: str
    first_name: str
    last_name: str  
    email: str  # Using regular str for now, can add EmailStr later when email-validator is installed
    role: UserRole
    admin: bool = False