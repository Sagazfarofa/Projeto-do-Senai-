from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, Base, get_db, SessionLocal
from models import Usuario, Aluno
from schemas import LoginRequest, AlunoCreate

app = FastAPI(title="SAEP")

Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# cria usuário padrão
def criar_usuario_padrao():
    db = SessionLocal()

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