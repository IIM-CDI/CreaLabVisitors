from pydantic import BaseModel


class CardData(BaseModel):
    card_id: str