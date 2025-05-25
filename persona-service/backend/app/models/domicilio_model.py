from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String, Column
from sqlalchemy.orm import relationship

from app.models.base_model import BaseModel

class Domicilio(BaseModel):

    __tablename__ = "domicilios"

    id_domicilio=Column(Integer, primary_key=True)
    domicilio_calle=Column(String(50), nullable=False)
    domicilio_numero=Column(String (10), nullable=False)
    domicilio_piso=Column(String(3), nullable=True)
    domicilio_dpto=Column(String(2), nullable=True)

    codigo_postal_id=Column(Integer, ForeignKey('domicilios_postales.id_domicilio_postal'))

    codigo_postal=relationship("Domicilio_Postal")



