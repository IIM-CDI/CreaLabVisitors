from pydantic import BaseModel


class CardScan(BaseModel):
    """Card scan data from reader"""
    card_id: str