from sqlalchemy import Column, Integer, String
from database import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True)
    senha = Column(String)
    nome = Column(String)
    materia = Column(String)