from app.extensions import Base
from sqlalchemy import Integer, String, DateTime, Column
from datetime import datetime, timezone

class Tipo_Documento(Base):

    __tablename__ = "tipo_documentos"

    id_tipo_documento=Column(Integer, primary_key=True)
    tipo_documento=Column(String(50), nullable=False)

    created_at=Column(DateTime, default=datetime.now(timezone.utc))
    updated_at=Column(DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))