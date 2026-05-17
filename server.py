from flask import Flask, render_template, redirect, request, session
import json
import csv
import os
from datetime import datetime

app = Flask(__name__)
app.secret_key = "123"

ARQ_ALUNOS = "alunos.json"
ARQ_PRESENCA = "presencas.csv"

# ===== carregar alunos =====
def carregar_alunos():
    if os.path.exists(ARQ_ALUNOS):
        with open(ARQ_ALUNOS, "r") as f:
            return json.load(f)
    return {}

# ===== salvar alunos =====
def salvar_alunos(alunos):
    with open(ARQ_ALUNOS, "w") as f:
        json.dump(alunos, f, indent=4)

# ===== carregar presenças =====
def carregar_presencas():
    lista = []
    if os.path.exists(ARQ_PRESENCA):
        with open(ARQ_PRESENCA, "r") as f:
            reader = csv.DictReader(f)
            for linha in reader:
                lista.append(linha)
    return lista

# ===== calcular frequência =====
def calcular_frequencia(presencas):
    total_dias = len(set(p.get("Data") for p in presencas if p.get("Data")))
    freq = {}

    for p in presencas:
        nome = p.get("Nome")
        data = p.get("Data")

        if nome and data:
            if nome not in freq:
                freq[nome] = set()
            freq[nome].add(data)

    for nome in freq:
        dias = len(freq[nome])
        freq[nome] = round((dias / total_dias) * 100, 1) if total_dias > 0 else 0

    return freq

# ===== presentes hoje =====
def contar_presentes(presencas):
    hoje = datetime.now().strftime("%Y-%m-%d")
    return len(set(p.get("UID") for p in presencas if p.get("Data") == hoje))

# ===== ranking =====
def calcular_ranking(freq):
    return sorted(freq.items(), key=lambda x: x[1], reverse=True)

# ===== LOGIN =====
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        senha = request.form.get("senha")

        if senha == "admin123":
            session["logado"] = True
            return redirect("/")
        else:
            return render_template("login.html", erro="Senha incorreta")

    return render_template("login.html")

# ===== LOGOUT =====
@app.route("/logout")
def logout():
    session.clear()
    return redirect("/login")

# ===== PAINEL =====
@app.route("/")
def index():
    if not session.get("logado"):
        return redirect("/login")

    alunos = carregar_alunos()
    presencas = carregar_presencas()
    frequencia = calcular_frequencia(presencas)
    presentes = contar_presentes(presencas)
    ranking = calcular_ranking(frequencia)

    return render_template(
        "index.html",
        alunos=alunos,
        presencas=presencas,
        frequencia=frequencia,
        presentes=presentes,
        ranking=ranking
    )

# ===== ATIVAR / BLOQUEAR =====
@app.route("/toggle/<uid>")
def toggle(uid):
    if not session.get("logado"):
        return redirect("/login")

    alunos = carregar_alunos()

    if uid in alunos:
        alunos[uid]["ativo"] = not alunos[uid]["ativo"]

    salvar_alunos(alunos)
    return redirect("/")

# ===== EDITAR NOME (NOVO) =====
@app.route("/editar/<uid>", methods=["POST"])
def editar(uid):
    if not session.get("logado"):
        return redirect("/login")

    alunos = carregar_alunos()
    nome = request.form.get("nome")

    if uid in alunos and nome:
        alunos[uid]["nome"] = nome
        alunos[uid]["ativo"] = True  # já ativa automaticamente

    salvar_alunos(alunos)
    return redirect("/")

# ===== DELETAR (EXTRA TOP) =====
@app.route("/deletar/<uid>")
def deletar(uid):
    if not session.get("logado"):
        return redirect("/login")

    alunos = carregar_alunos()

    if uid in alunos:
        del alunos[uid]

    salvar_alunos(alunos)
    return redirect("/")

# ===== RODAR =====
if __name__ == "__main__":
    app.run(debug=True)