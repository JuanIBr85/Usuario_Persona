from datetime import datetime, timezone
from extensions import Base
from sqlalchemy import DateTime, ForeignKey, Integer, String, Column
from sqlalchemy.orm import relationship

class Domicilio(Base):

    __tablename__ = "domicilios"

    id_domicilio=Column(Integer, primary_key=True)
    domicilio_calle=Column(String(50), nullable=False)
    domicilio_numero=Column(String (10), nullable=True)
    domicilio_piso=Column(String(3), nullable=True)
    domicilio_dpto=Column(String(2), nullable=True)

    codigo_postal_id=Column(Integer, ForeignKey('domicilios_postales.id_domicilio_postal'))

    codigo_postal=relationship("Domicilio_Postal")

    created_at=Column(DateTime, default=datetime.now(timezone.utc))
    updated_at=Column(DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))
    deleted_at = Column(DateTime, nullable=True)
    
   


