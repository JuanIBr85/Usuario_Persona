
from sqlalchemy import ForeignKey, Integer, String, DateTime, Column, Date
from datetime import datetime, timezone

from app.models.base_model import BaseModel


class Contacto(BaseModel):

    __tablename__ = "contactos"

    id_contacto=Column(Integer, primary_key=True)
    telefono_fijo=Column(String(15), nullable=True)
    telefono_movil=Column(String(15), nullable=False)
    red_social_contacto=Column(String(50),nullable=True)
