from pydantic import BaseModel


class CardScan(BaseModel):
    card_id: str