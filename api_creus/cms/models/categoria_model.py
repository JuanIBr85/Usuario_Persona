from models import db
from sqlalchemy.orm import relationship


class Categoria(db.Model):
    __tablename__ = 'categoria'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(255), nullable=False)
    observacion = db.Column(db.Text, nullable=True)

    preguntas = relationship(
        "PreguntaFrecuente", backref="categoria", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'observacion': self.observacion
        }
