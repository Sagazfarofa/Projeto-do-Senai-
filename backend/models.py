from sqlalchemy import Column, Integer, String, Boolean
from database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True)
    senha = Column(String)
    nome = Column(String)
    materia = Column(String)


class Aluno(Base):
    __tablename__ = "alunos"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String)
    turma = Column(String)
    uid = Column(String, unique=True, nullable=True)
    ativo = Column(Boolean, default=True)