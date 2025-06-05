from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta, timezone
from app.models.base_model import Base

class OtpResetPassword(Base):
    __tablename__ = 'otp_reset_password'

    id = Column(Integer, primary_key=True)
    usuario_id = Column(Integer, ForeignKey('usuario.id_usuario'), nullable=False)
    codigo_otp = Column(String(6), nullable=False)
    expira_en = Column(DateTime(timezone=True), nullable=False)
    usado = Column(Boolean, default=False)
    creado_en = Column(DateTime, default=datetime.now(timezone.utc))

    usuario = relationship("Usuario")
