
from sqlalchemy import Integer, String, DateTime, Column
from datetime import datetime, timezone

from app.models.base_model import BaseModel

class Tipo_Documento(BaseModel):

    __tablename__ = "tipo_documentos"

    id_tipo_documento=Column(Integer, primary_key=True)
    tipo_documento=Column(String(50), nullable=False)



