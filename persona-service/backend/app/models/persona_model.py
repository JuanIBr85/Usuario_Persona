from app.extensions import Base
from sqlalchemy import ForeignKey, Integer, String, DateTime, Column, Date
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

class Persona(Base):

    __tablename__ ='personas'

    id_persona = Column(Integer, primary_key=True)
    nombre_persona=Column(String(50), nullable=False)
    apellido_persona=Column(String(50),nullable=False)
    fecha_nacimiento_persona = Column(Date,nullable=False)
    tipo_documento = Column(String(20), nullable=False) 
    num_doc_persona=Column(String(11), nullable=False)
    
    usuario_id = Column(Integer, nullable=True, unique=True)
    domicilio_id=Column(Integer, ForeignKey('domicilios.id_domicilio'))
    contacto_id=Column(Integer, ForeignKey('contactos.id_contacto'))
    extendida_id = Column(Integer, ForeignKey('personas_extendidas.id_extendida'))

    domicilio = relationship("Domicilio")
    contacto = relationship("Contacto")
    persona_extendida = relationship("PersonaExtendida")

    created_at=Column(DateTime, default=datetime.now(timezone.utc))
    updated_at=Column(DateTime, nullable=True)
    deleted_at=Column(DateTime, nullable=True)





