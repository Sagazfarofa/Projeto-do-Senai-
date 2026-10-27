
import serial
import requests
import time

PORTA = "COM6"
BAUD_RATE = 9600
API_URL = "http://127.0.0.1:8000"

# Evita processar o mesmo UID repetidamente enquanto
# o cartão permanece sobre o leitor.
ultimo_uid = None
ultimo_tempo = 0
INTERVALO_RELEITURA = 3


def main():
    global ultimo_uid, ultimo_tempo

    try:
        with serial.Serial(PORTA, BAUD_RATE, timeout=1) as esp32:
            time.sleep(2)

            print("ESP32 conectado!")
            print("Leitor SAEP iniciado.")

            while True:
                linha = esp32.readline().decode(
                    "utf-8", errors="ignore"
                ).strip()

                if not linha.startswith("UID do cartao:"):
                    continue

                uid = " ".join(
                    linha.split(":", 1)[1].upper().split()
                )

                if not uid:
                    continue

                agora = time.time()

                if (
                    uid == ultimo_uid
                    and agora - ultimo_tempo < INTERVALO_RELEITURA
                ):
                    continue

                ultimo_uid = uid
                ultimo_tempo = agora

                try:
                    estado_resposta = requests.get(
                        f"{API_URL}/rfid/cadastro/estado",
                        timeout=3
                    )
                    estado_resposta.raise_for_status()
                    estado = estado_resposta.json()

                    if estado.get("modo") == "cadastro":
                        resposta = requests.post(
                            f"{API_URL}/rfid/cadastro/leitura",
                            json={"uid": uid},
                            timeout=3
                        )

                        if resposta.ok:
                            print("Cartão lido para cadastro:", uid)
                        else:
                            print(
                                "Erro no cadastro:",
                                resposta.status_code,
                                resposta.text
                            )

                    else:
                        resposta = requests.post(
                            f"{API_URL}/rfid",
                            json={"uid": uid},
                            timeout=5
                        )

                        if resposta.ok:
                            print(
                                "Presença registrada:",
                                resposta.json()
                            )
                        else:
                            print(
                                "Erro ao registrar:",
                                resposta.status_code,
                                resposta.text
                            )

                except requests.RequestException as erro:
                    print("Erro na API:", erro)

    except serial.SerialException as erro:
        print("Erro na porta serial:", erro)
        print(
            "Confira a porta COM e feche o Monitor Serial "
            "da Arduino IDE."
        )

    except KeyboardInterrupt:
        print("\nLeitor encerrado.")


if __name__ == "__main__":
    main()
