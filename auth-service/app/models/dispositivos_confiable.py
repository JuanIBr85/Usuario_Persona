from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base_model import Base
from datetime import datetime, timezone


class DispositivoConfiable(Base):
    __tablename__ = "dispositivo_confiable"

    id = Column(Integer, primary_key=True)
    usuario_id = Column(Integer, ForeignKey("usuario.id_usuario"))
    token_dispositivo = Column(String(512), unique=True, index=True)
    user_agent = Column(String(256))
    fecha_registro = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    fecha_expira = Column(DateTime(timezone=True))

    usuario = relationship("Usuario", back_populates="dispositivos")