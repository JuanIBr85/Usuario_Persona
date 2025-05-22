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
    num_doc_persona=Column(String(8), nullable=False)
    
    usuario_id = Column(Integer, nullable=False)

    domicilio_id=Column(Integer, ForeignKey('domicilios.id_domicilio'))
    tipo_documento_id=Column(Integer, ForeignKey('tipo_documentos.id_tipo_documento'))
    contacto_id=Column(Integer, ForeignKey('contactos.id_contacto'))

    domicilio = relationship("Domicilio")
    tipo_documento = relationship("Tipo_Documento")
    contacto = relationship("Contacto")

    created_at=Column(DateTime, default=datetime.now(timezone.utc))
    updated_at=Column(DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))
    deleted_at=Column(DateTime, nullable=True)





