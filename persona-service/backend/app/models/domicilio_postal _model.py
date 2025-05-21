from extensions import db
from sqlalchemy import ForeignKey, Integer, String, DateTime, Column, Date
from datetime import datetime, timezone

class Domicilio_Postal(db.Model):

    __tablename__ = "domicilios_postales"

    id_domicilio_postal=Column(Integer, primary_key=True)
    codigo_postal=Column(String(6), nullable=False)
    localidad = Column(String(100), nullable=False)
    partido = Column(String(100), nullable=False)
    provincia = Column(String(100), nullable=False)
    pais = Column(String(100), nullable=False)
