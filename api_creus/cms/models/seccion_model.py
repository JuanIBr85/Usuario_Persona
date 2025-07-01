from models import db
from sqlalchemy.orm import relationship


class Seccion(db.Model):
    __tablename__ = 'seccion'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(255), nullable=False)
    descripcion = db.Column(db.Text)
    visible = db.Column(db.Boolean, default=True)

    bloques = relationship(
        "BloqueSeccion", backref="seccion", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'descripcion': self.descripcion,
            'visible': self.visible
        }
