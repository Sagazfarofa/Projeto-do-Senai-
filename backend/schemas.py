from pydantic import BaseModel


class LoginRequest(BaseModel):
    email: str
    senha: str


class UsuarioResponse(BaseModel):
    id: int
    email: str
    nome: str
    materia: str

    class Config:
        from_attributes = True


class AlunoCreate(BaseModel):
    nome: str
    turma: str
    uid: str | None = None


class AlunoResponse(BaseModel):
    id: int
    nome: str
    turma: str
    uid: str | None = None
    ativo: bool

    class Config:
        from_attributes = True