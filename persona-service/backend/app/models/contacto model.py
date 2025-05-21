from extensions import db
from sqlalchemy import ForeignKey, Integer, String, DateTime, Column, Date
from datetime import datetime, timezone


class Contacto(db.Model):

    __tablename__ = "contacto"

    id_contacto=Column(Integer, primary_key=True)
    telefono_fijo_=Column(String(15), nullable=True)
    telefono_movil_=Column(String(15), nullable=False)
    red_social_contacto=Column(String(50),nullable=True)

    created_at=Column(DateTime, default=datetime.now(timezone.utc))
    updated_at=Column(DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))