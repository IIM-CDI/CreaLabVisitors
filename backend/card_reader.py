import serial
import requests

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
        
        # Call the submit endpoint
        requests.post("http://localhost:8000/submit", json={"card_id": card_id})
