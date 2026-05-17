import serial
import time

ser = serial.Serial("COM4", 9600, timeout=1)
time.sleep(2)

print("Conectado!")

while True:
    if ser.in_waiting:
        print(ser.readline().decode())