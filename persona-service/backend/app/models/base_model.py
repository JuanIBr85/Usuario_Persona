
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime
from sqlalchemy.orm import DeclarativeBase

#Este es el modelo base, contiene los valores comunes a todos los modelos
class BaseModel(DeclarativeBase):
    created_at=Column(DateTime, default=datetime.now(timezone.utc))
    updated_at=Column(DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))
    deleted_at=Column(DateTime, nullable=True)

    #Eliminado logico
    def set_delete(self):
        self.deleted_at = datetime.now(timezone.utc)