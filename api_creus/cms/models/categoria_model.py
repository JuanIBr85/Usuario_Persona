from models import db


class Categoria(db.Model):
    __tablename__ = 'categoria'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(255), nullable=False, unique=True)
    observacion = db.Column(db.Text)

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "observacion": self.observacion
        }
