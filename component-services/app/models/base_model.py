from datetime import datetime, timezone
from sqlalchemy.orm import declarative_mixin
from sqlalchemy import Column, Integer, DateTime
from app.extensions import Base

class BaseModel(Base):
    """Clase base para todos los modelos"""

    __abstract__ = True

    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=datetime.now(timezone.utc),
        onupdate=datetime.now(timezone.utc),
    )
    deleted_at = Column(DateTime, nullable=True)

    def set_delete(self):
        self.deleted_at = datetime.now(timezone.utc)
