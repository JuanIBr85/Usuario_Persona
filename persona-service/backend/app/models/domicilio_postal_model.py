from extensions import Base
from sqlalchemy import ForeignKey, Integer, String, DateTime, Column, Date
from datetime import datetime, timezone

class Domicilio_Postal(Base):

    __tablename__ = "domicilios_postales"

    id_domicilio_postal=Column(Integer, primary_key=True)
    codigo_postal=Column(String(8), nullable=False)
    localidad = Column(String(100), nullable=False)
    partido = Column(String(100), nullable=False)
    provincia = Column(String(100), nullable=False)
    pais = Column(String(100), nullable=False)
