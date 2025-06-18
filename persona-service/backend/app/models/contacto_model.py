from app.extensions import Base
from sqlalchemy import ForeignKey, Integer, String, DateTime, Column, Date, Text
from datetime import datetime, timezone


class Contacto(Base):

    __tablename__ = "contactos"

    id_contacto=Column(Integer, primary_key=True)
    telefono_fijo=Column(String(15), nullable=True)
    telefono_movil=Column(String(15), nullable=False)
    red_social_contacto=Column(String(50),nullable=True)
    red_social_nombre=Column(String(20), nullable=True)
    email_contacto=Column(String(50), nullable=False)
    observacion_contacto=Column(String(300), nullable=True)

    created_at=Column(DateTime, default=datetime.now(timezone.utc))
    updated_at=Column(DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))
    deleted_at=Column(DateTime, nullable=True)