import serial
import json
from datetime import datetime
import os
import csv
import time

PORTA = "COM4"
BAUD = 9600

ARQ_ALUNOS = "alunos.json"
ARQ_PRESENCA = "presencas.csv"

# =========================
# CARREGAR ALUNOS
# =========================
def carregar_alunos():

    if os.path.exists(ARQ_ALUNOS):
        with open(ARQ_ALUNOS, "r", encoding="utf-8") as f:
            return json.load(f)

    return {}

# =========================
# SALVAR ALUNOS
# =========================
def salvar_alunos(alunos):

    with open(ARQ_ALUNOS, "w", encoding="utf-8") as f:
        json.dump(alunos, f, indent=4, ensure_ascii=False)

# =========================
# SALVAR PRESENÇA
# =========================
def salvar_presenca(nome, uid):

    agora = datetime.now()

    data_hoje = agora.strftime("%Y-%m-%d")
    hora = agora.strftime("%H:%M:%S")

    registros = []

    # lê registros do dia
    if os.path.exists(ARQ_PRESENCA):

        with open(ARQ_PRESENCA, "r", encoding="utf-8") as f:

            reader = csv.DictReader(f)

            for linha in reader:

                if (
                    linha["UID"] == uid and
                    linha["Data"] == data_hoje
                ):
                    registros.append(linha)

    qtd = len(registros)

    # máximo 2 registros
    if qtd >= 2:
        return "BLOQUEADO", hora

    tipo = "ENTRADA" if qtd == 0 else "SAIDA"

    status = tipo

    # horários
    entrada_limite = agora.replace(
        hour=7,
        minute=20,
        second=0,
        microsecond=0
    )

    saida_limite = agora.replace(
        hour=16,
        minute=0,
        second=0,
        microsecond=0
    )

    # entrada
    if tipo == "ENTRADA":

        if agora > entrada_limite:
            status = "ATRASADO"
        else:
            status = "ENTRADA OK"

    # saída
    if tipo == "SAIDA":

        if agora < saida_limite:
            status = "FALTA"
        else:
            status = "SAIDA OK"

    # cria arquivo se não existir
    arquivo_existe = os.path.exists(ARQ_PRESENCA)

    with open(
        ARQ_PRESENCA,
        "a",
        newline="",
        encoding="utf-8"
    ) as f:

        writer = csv.writer(f)

        # cabeçalho
        if (
            not arquivo_existe or
            os.path.getsize(ARQ_PRESENCA) == 0
        ):
            writer.writerow([
                "Nome",
                "UID",
                "Data",
                "Hora",
                "Tipo",
                "Status"
            ])

        writer.writerow([
            nome,
            uid,
            data_hoje,
            hora,
            tipo,
            status
        ])

    return status, hora

# =========================
# SERIAL
# =========================
ser = serial.Serial(
    PORTA,
    BAUD,
    timeout=0.1
)

time.sleep(2)

print("Sistema iniciado...")

# =========================
# LOOP PRINCIPAL
# =========================
while True:

    try:

        if ser.in_waiting > 0:

            linha = ser.readline() \
                .decode("utf-8", errors="ignore") \
                .strip()

            if not linha:
                continue

            print("Recebido:", linha)

            if "UID:" in linha:

                uid = linha.replace("UID:", "").strip()

                print("Cartao:", uid)

                alunos = carregar_alunos()

                # cria aluno automático
                if uid not in alunos:

                    alunos[uid] = {
                        "nome": f"Aluno_{len(alunos)+1}",
                        "ativo": False
                    }

                    salvar_alunos(alunos)

                nome = alunos[uid]["nome"]
                ativo = alunos[uid]["ativo"]

                status, hora = salvar_presenca(nome, uid)

                # monta resposta
                if ativo:

                    if status == "BLOQUEADO":
                        resposta = f"NEGADO,{nome},LIMITE"

                    else:
                        resposta = f"OK,{nome},{status}"

                else:
                    resposta = f"NEGADO,{nome},BLOQUEADO"

                print("Enviado:", resposta)

                # envia resposta
                ser.write((resposta + "\n").encode("utf-8"))
                ser.flush()

    except Exception as e:

        print("Erro:", e)