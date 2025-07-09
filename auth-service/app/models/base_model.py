from datetime import datetime, timezone
from sqlalchemy import Column, DateTime
from sqlalchemy.orm import DeclarativeBase
"""
Este es el modelo base, contiene los valores comunes a todos los modelos
como las fechas de creacion, actualizacion y eliminacion logica
Se utiliza para heredar en otros modelos de la aplicacion
"""
class Base(DeclarativeBase):
    created_at=Column(DateTime, default=datetime.now(timezone.utc))
    updated_at=Column(DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))
    deleted_at=Column(DateTime, nullable=True)

    
    def set_delete(self):
        """
        Marca el registro como eliminado lógicamente.
        En vez de eliminarlo físicamente de la base de datos, se establece la fecha de eliminación.
        """
        self.deleted_at = datetime.now(timezone.utc)