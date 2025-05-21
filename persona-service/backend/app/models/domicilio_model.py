from datetime import datetime, timezone
from extensions import db
from sqlalchemy import DateTime, ForeignKey, Integer, String, Column

class Domicilio(db.Model):

    __tablename__ = "domicilios"

    id_domicilio=Column(Integer, primary_key=True)
    domicilio_calle=Column(String(50), nullable=False)
    domicilio_numero=Column(String (8), nullable=True)
    domicilio_piso=Column(String(3), nullable=True)
    domicilio_dpto=Column(String(2), nullable=True)

    #Falta completar
    codigo_postal_id=Column(Integer, ForeignKey(''))

    #Analizar si es correcto
    created_at=Column(DateTime, default=datetime.now(timezone.utc))
    updated_at=Column(DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))
    deleted_at = Column(DateTime, nullable=True)
    
    #Definir relacion contabla "domicilio_postal" y "Persona"


