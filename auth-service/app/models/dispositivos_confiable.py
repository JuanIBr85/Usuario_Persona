from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base_model import Base
from datetime import datetime, timezone


class DispositivoConfiable(Base):
    """
    Modelo que representa un dispositivo confiable registrado por un usuario.
    Estos dispositivos permiten al usuario omitir la verificación OTP (2FA)
    en futuros logins si accede desde uno previamente validado.

    Atributos:
        id (int): Identificador único del dispositivo.
        usuario_id (int): Referencia al usuario dueño del dispositivo.
        token_dispositivo (str): Token único que identifica al dispositivo.
        user_agent (str): Cadena descriptiva del navegador/dispositivo (para mostrar o validar).
        fecha_registro (datetime): Fecha y hora en la que se registró el dispositivo.
        fecha_expira (datetime): Fecha en la que el dispositivo deja de ser confiable automáticamente.

    Relaciones:
        usuario (Usuario): Relación inversa con el modelo de Usuario.
    """
    __tablename__ = "dispositivo_confiable"

    id = Column(Integer, primary_key=True)
    usuario_id = Column(Integer, ForeignKey("usuario.id_usuario"))
    token_dispositivo = Column(String(512), unique=True, index=True)
    user_agent = Column(String(256))
    fecha_registro = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    fecha_expira = Column(DateTime(timezone=True))
    
    # Relación con el usuario que posee este dispositivo
    usuario = relationship("Usuario", back_populates="dispositivos")