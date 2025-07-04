from datetime import datetime, timezone
from app.extensions import Base
from sqlalchemy import DateTime, ForeignKey, Integer, String, Column, Text
from sqlalchemy.orm import relationship

class Domicilio(Base):

    __tablename__ = "domicilios"

    id_domicilio=Column(Integer, primary_key=True)
    domicilio_calle=Column(String(50), nullable=False)
    domicilio_numero=Column(String (10), nullable=False)
    domicilio_piso=Column(String(3), nullable=True)
    domicilio_dpto=Column(String(2), nullable=True)
    domicilio_referencia=Column(String(200), nullable=True)

    codigo_postal_id=Column(Integer, ForeignKey('domicilios_postales.id_domicilio_postal'))
    
    codigo_postal=relationship("DomicilioPostal", backref="domicilios", lazy="joined")

    created_at=Column(DateTime,default=lambda: datetime.now(timezone.utc))
    updated_at=Column(DateTime, nullable=True)
    deleted_at = Column(DateTime, nullable=True)
    
   


