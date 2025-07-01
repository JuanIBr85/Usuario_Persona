from models import db

class Estado(db.Model):
    __tablename__ = 'estado'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(255), nullable=False)
    observaciones = db.Column(db.Text)
    activo = db.Column(db.Boolean, nullable=False, default=True)

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "observaciones": self.observaciones,
            "activo": self.activo
        }

    def __repr__(self):
        return f"<Estado {self.nombre}>"

