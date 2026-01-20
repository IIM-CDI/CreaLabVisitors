import serial
import requests
import threading
import uvicorn

def run_card_reader():
    ser = serial.Serial(
        port="/dev/ttyUSB0",
        baudrate=9600,
        bytesize=8,
        parity='N',
        stopbits=1,
        timeout=1
    )

    print("En attente de badge...")

    while True:
        data = ser.read(128)
        if data:
            print("RAW :", data)
            try:
                card_id = data.decode().strip()
                print("ASCII:", card_id)
            except UnicodeDecodeError:
                card_id = data.hex()
                print("HEX :", card_id)
            
            try:
                requests.post("http://localhost:8000/getCard", json={"card_id": card_id})
            except:
                pass

if __name__ == "__main__":
    # Start card reader in background thread
    reader_thread = threading.Thread(target=run_card_reader, daemon=True)
    reader_thread.start()
    
    # Start FastAPI server
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
