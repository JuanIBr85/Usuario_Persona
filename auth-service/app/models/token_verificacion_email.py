from app.database import Base
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
import datetime
import uuid

class TokenVerificacionEmail(Base):
    __tablename__ = 'tokens_verificacion_email'

    id = Column(Integer, primary_key=True)
    token = Column(String, unique=True, default=lambda: str(uuid.uuid4()))
    usuario_id = Column(Integer, ForeignKey('usuarios.id'))
    usuario = relationship("Usuario", backref="tokens_verificacion_email")
    expiracion = Column(DateTime, default=lambda: datetime.datetime.utcnow() + datetime.timedelta(hours=1))
    usado = Column(Boolean, default=False)

    def esta_expirado(self):
        return datetime.datetime.utcnow() > self.expiracion