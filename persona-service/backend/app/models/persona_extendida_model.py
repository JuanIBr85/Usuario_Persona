from app.extensions import Base
from sqlalchemy import Date, Integer, String, DateTime, Column,ForeignKey
from datetime import datetime, timezone
from app.models.persona_model import Persona
from sqlalchemy.orm import relationship


class PersonaExtendida(Base):
    __tablename__ = 'personas_extendidas'

    id_extendida = Column(Integer, primary_key=True) # va conectado con Persona
    estado_civil = Column(String(30), nullable=True)
    ocupacion = Column(String(100), nullable=True)
    estudios_alcanzados = Column(String(100), nullable=True) 
    vencimiento_dni = Column(Date,nullable=True)
    foto_perfil = Column(String(255), nullable=True)

    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))
    deleted_at= Column(DateTime, nullable=True)