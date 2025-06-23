from models import db

class Coordinador(db.Model):
    __tablename__ = 'coordinador'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(255), nullable=False)
    apellido = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), nullable=False, unique=True)
    telefono = db.Column(db.Integer)
    id_estado = db.Column(db.Integer, db.ForeignKey('estado.id'), nullable=False)
    observaciones = db.Column(db.Text)

    # Relaciones
    estado = db.relationship('Estado', backref='coordinadores', lazy='joined')

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "apellido": self.apellido,
            "email": self.email,
            "telefono": self.telefono,
            "id_estado": self.id_estado,
            "observaciones": self.observaciones
        }
    
    def __repr__(self):
        return f"<Coordinador {self.nombre} {self.apellido}>"

