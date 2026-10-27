
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel
from threading import Lock

from database import engine, Base, get_db, SessionLocal
from models import Usuario, Aluno, Presenca
from schemas import LoginRequest, AlunoCreate, PresencaCreate


# Dados recebidos do ESP32
class LeituraRFID(BaseModel):
    uid: str


app = FastAPI(title="SAEP")

# Controle do leitor RFID
rfid_estado = {
    "modo": "presenca",
    "ultimo_uid": None
}
rfid_lock = Lock()

Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Cria usuário padrão
def criar_usuario_padrao():
    db = SessionLocal()

    try:
        usuario = db.query(Usuario).filter(
            Usuario.email == "admin@saep.com"
        ).first()

        if not usuario:
            novo = Usuario(
                email="admin@saep.com",
                senha="123",
                nome="Administrador",
                materia="Coordenação"
            )

            db.add(novo)
            db.commit()
    finally:
        db.close()


criar_usuario_padrao()


@app.get("/")
def inicio():
    return {"mensagem": "API SAEP funcionando"}


@app.post("/login")
def login(
    dados: LoginRequest,
    db: Session = Depends(get_db)
):
    usuario = db.query(Usuario).filter(
        Usuario.email == dados.email,
        Usuario.senha == dados.senha
    ).first()

    if not usuario:
        raise HTTPException(
            status_code=401,
            detail="Email ou senha inválidos"
        )

    return {
        "id": usuario.id,
        "nome": usuario.nome,
        "email": usuario.email,
        "materia": usuario.materia
    }


@app.get("/alunos")
def listar_alunos(db: Session = Depends(get_db)):
    alunos = db.query(Aluno).all()

    return [
        {
            "id": aluno.id,
            "nome": aluno.nome,
            "turma": aluno.turma,
            "uid": aluno.uid,
            "ativo": aluno.ativo
        }
        for aluno in alunos
    ]


@app.post("/alunos")
def cadastrar_aluno(
    dados: AlunoCreate,
    db: Session = Depends(get_db)
):
    aluno = Aluno(
        nome=dados.nome,
        turma=dados.turma,
        uid=dados.uid
    )

    db.add(aluno)
    db.commit()
    db.refresh(aluno)

    return {
        "mensagem": "Aluno cadastrado com sucesso",
        "id": aluno.id
    }


@app.put("/alunos/{aluno_id}")
def editar_aluno(
    aluno_id: int,
    dados: AlunoCreate,
    db: Session = Depends(get_db)
):
    aluno = db.query(Aluno).filter(
        Aluno.id == aluno_id
    ).first()

    if not aluno:
        raise HTTPException(
            status_code=404,
            detail="Aluno não encontrado"
        )

    aluno.nome = dados.nome
    aluno.turma = dados.turma
    aluno.uid = dados.uid

    db.commit()

    return {"mensagem": "Aluno atualizado"}


@app.delete("/alunos/{aluno_id}")
def excluir_aluno(
    aluno_id: int,
    db: Session = Depends(get_db)
):
    aluno = db.query(Aluno).filter(
        Aluno.id == aluno_id
    ).first()

    if not aluno:
        raise HTTPException(
            status_code=404,
            detail="Aluno não encontrado"
        )

    db.delete(aluno)
    db.commit()

    return {"mensagem": "Aluno removido"}


@app.post("/presencas")
def registrar_presenca(
    dados: PresencaCreate,
    db: Session = Depends(get_db)
):
    presenca = Presenca(
        aluno_id=dados.aluno_id,
        nome=dados.nome,
        uid=dados.uid,
        data=dados.data,
        hora=dados.hora,
        tipo=dados.tipo,
        status=dados.status
    )

    db.add(presenca)
    db.commit()
    db.refresh(presenca)

    return {
        "mensagem": "Presença registrada",
        "id": presenca.id
    }


@app.get("/presencas")
def listar_presencas(
    db: Session = Depends(get_db)
):
    presencas = db.query(Presenca).order_by(
        Presenca.id.desc()
    ).all()

    return [
        {
            "id": p.id,
            "aluno_id": p.aluno_id,
            "nome": p.nome,
            "uid": p.uid,
            "data": p.data,
            "hora": p.hora,
            "tipo": p.tipo,
            "status": p.status
        }
        for p in presencas
    ]


# Recebe o UID enviado pelo ESP32 e registra a presença
@app.post("/rfid")
def ler_cartao(
    dados: LeituraRFID,
    db: Session = Depends(get_db)
):
    # Normaliza o UID: remove espaços e converte para maiúsculas
    uid_lido = "".join(dados.uid.split()).upper()

    alunos = db.query(Aluno).all()

    aluno = next(
        (
            a for a in alunos
            if a.uid
            and "".join(a.uid.split()).upper() == uid_lido
        ),
        None
    )

    if not aluno:
        raise HTTPException(
            status_code=404,
            detail="Cartão não cadastrado no banco de dados"
        )

    if not aluno.ativo:
        raise HTTPException(
            status_code=403,
            detail="Aluno inativo"
        )

    agora = datetime.now()

    presenca = Presenca(
        aluno_id=aluno.id,
        nome=aluno.nome,
        uid=uid_lido,
        data=agora.strftime("%Y-%m-%d"),
        hora=agora.strftime("%H:%M:%S"),
        tipo="ENTRADA",
        status="ENTRADA OK"
    )

    db.add(presenca)
    db.commit()
    db.refresh(presenca)

    return {
        "mensagem": "Presença registrada com sucesso",
        "id": presenca.id,
        "aluno_id": aluno.id,
        "aluno": aluno.nome,
        "uid": uid_lido,
        "data": presenca.data,
        "hora": presenca.hora,
        "tipo": presenca.tipo,
        "status": presenca.status
    }


# Inicia o modo de cadastro de cartão
@app.post("/rfid/cadastro/iniciar")
def iniciar_cadastro():
    with rfid_lock:
        rfid_estado["modo"] = "cadastro"
        rfid_estado["ultimo_uid"] = None

    return {"mensagem": "Aproxime o cartão do leitor", "modo": "cadastro"}


# Consulta o estado do leitor
@app.get("/rfid/cadastro/estado")
def estado_cadastro():
    with rfid_lock:
        return {
            "modo": rfid_estado["modo"],
            "uid": rfid_estado["ultimo_uid"]
        }


# Recebe uma leitura do programa Python
@app.post("/rfid/cadastro/leitura")
def receber_leitura_cadastro(dados: LeituraRFID):
    uid = " ".join(dados.uid.upper().split())

    if not uid:
        raise HTTPException(status_code=400, detail="UID vazio")

    with rfid_lock:
        if rfid_estado["modo"] != "cadastro":
            return {"mensagem": "Leitura ignorada"}

        rfid_estado["ultimo_uid"] = uid

    return {"mensagem": "Cartão lido", "uid": uid}


# Encerra o modo de cadastro
@app.post("/rfid/cadastro/cancelar")
def cancelar_cadastro():
    with rfid_lock:
        rfid_estado["modo"] = "presenca"
        rfid_estado["ultimo_uid"] = None

    return {"mensagem": "Modo de presença ativado"}
