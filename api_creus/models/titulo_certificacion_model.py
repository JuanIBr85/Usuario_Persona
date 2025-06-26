from models import db

class TituloCertificacion(db.Model):
    __tablename__ = 'titulo_certificacion'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(255), nullable=False, unique=True)
    observaciones = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'observaciones': self.observaciones
        }

    def __repr__(self):
        return f'<TituloCertificacion {self.nombre}>'