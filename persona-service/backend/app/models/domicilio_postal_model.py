from app.extensions import Base
from sqlalchemy import  Integer, String, Column, UniqueConstraint

class DomicilioPostal(Base):

    __tablename__ = "domicilios_postales"
    __table_args__= (
        UniqueConstraint('codigo_postal', 'localidad', name='codigo_postal_localidad'),
    )


    id_domicilio_postal=Column(Integer, primary_key=True)
    codigo_postal=Column(String(8), nullable=False)
    localidad = Column(String(100), nullable=False)
    partido = Column(String(100), nullable=False)
    provincia = Column(String(100), nullable=False)

