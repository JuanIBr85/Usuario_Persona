from abc import ABC, abstractmethod
from sqlalchemy.orm import Session


class IUsuarioService(ABC):

    @abstractmethod
    def registrar_usuario(self, session: Session, data: dict) -> dict:
        pass

    @abstractmethod
    def login_usuario(self, session: Session, email: str, password: str) -> dict:
        pass