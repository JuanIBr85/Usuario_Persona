from abc import ABC, abstractmethod
from sqlalchemy.orm import Session


class IUsuarioService(ABC):

    @abstractmethod
    def registrar_usuario(self, session: Session, data: dict) -> dict:
        """
        Registra un nuevo usuario en la base de datos.
        Args:
            session (Session): Sesión activa de SQLAlchemy para interactuar con la base de datos.
            data (dict): Diccionario que contiene los datos del usuario (ej.: nombre, email, contraseña).
        Returns:
            dict: Información del usuario registrado.
        """
        pass

    @abstractmethod
    def login_usuario(self, session: Session, email: str, password: str) -> dict:
        """
        Autentica a un usuario validando su email y contraseña.
        Args:
            session (Session): Sesión activa de SQLAlchemy.
            email (str): Dirección de correo del usuario.
            password (str): Contraseña en texto plano (debe ser validada contra la base).
        Returns:
            dict: Información del usuario autenticado.
        """
        pass