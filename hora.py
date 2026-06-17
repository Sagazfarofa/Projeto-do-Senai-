import serial
from datetime import datetime

arduino = serial.Serial('COM4', 9600)

print("Sistema de hora iniciado...")

while True:
    if arduino.in_waiting:
        linha = arduino.readline().decode().strip()

        if linha == "GET_HORA":
            agora = datetime.now().strftime("%H:%M:%S")
            arduino.write((agora + "\n").encode())
            print("Hora enviada:", agora)