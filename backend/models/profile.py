from pydantic import BaseModel
from .user import UserRole


class ProfilData(BaseModel):
    card_id: str
    prenom: str
    nom: str
    email: str
    role: UserRole
    admin: bool