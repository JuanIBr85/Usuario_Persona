from datetime import datetime, timezone
from app import db


class BaseModel(db.Model):
    """Clase base para todos los modelos"""

    __abstract__ = True

    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime,
        default=datetime.now(timezone.utc),
        onupdate=datetime.now(timezone.utc),
    )
    deleted_at = db.Column(db.DateTime, nullable=True)

    def set_delete(self):
        self.deleted_at = datetime.now(timezone.utc)
