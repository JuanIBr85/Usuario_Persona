from extensions import db
from sqlalchemy import ForeignKey, Integer, String, DateTime, Column, Date
from datetime import datetime, timezone

class Persona(db.Model):

    __tablename__ ='personas'

    id_persona = Column(Integer, primary_key=True)
    nombre_persona=Column(String(50), nullable=False)
    apellido_persona=Column(String(50),nullable=False)
    fecha_nacimiento_persona = Column(Date,nullable=False)
    num_doc_persona=Column(String(8), nullable=False)

    #Falta completar
    domicilio_id=Column(Integer, ForeignKey(''))
    tipo_documento_id=Column(Integer, ForeignKey(''))
    contacto_id=Column(Integer, ForeignKey(''))

    created_at=Column(DateTime, default=datetime.now(timezone.utc))
    updated_at=Column(DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))
    deleted_at=Column(DateTime, nullable=True)

    # Definir relaciones con tablas "Tipo_Documento", "Contacto", Domicilio.



