from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def read_root():
    return {"Hello": "Bonjour"}


@router.get("/health")
def health_check():
    return {"status": "en bonne santé"}