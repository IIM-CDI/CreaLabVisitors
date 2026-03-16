import serial
import requests
import threading
import uvicorn
import logging
import os
from dotenv import load_dotenv

load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL")
BACKEND_URL = os.getenv("BACKEND_URL")

logging.basicConfig(level=logging.INFO)


def run_card_reader():
    ser = serial.Serial(
        port="/dev/ttyUSB0",
        baudrate=9600,
        bytesize=8,
        parity='N',
        stopbits=1,
        timeout=1
    )
    
    logging.info("Waiting for card scans...")
    
    while True:
        data = ser.read(128)
        if data:
            logging.debug("RAW: %s", data)
            try:
                card_id = data.decode().strip()
                logging.debug("Decoded card id: %s", card_id)
            except UnicodeDecodeError:
                card_id = data.hex()
                logging.debug("Hex card id: %s", card_id)
            
            try:
                requests.post(f"{BACKEND_URL}/getCard", json={"card_id": card_id})
            except Exception:
                logging.exception("Failed to post scanned card to backend")


if __name__ == "__main__":
    reader_thread = threading.Thread(target=run_card_reader, daemon=True)
    reader_thread.start()
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
