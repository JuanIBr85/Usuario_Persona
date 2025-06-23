from models import db

class Modalidad(db.Model):
    __tablename__ = 'modalidad'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(255), nullable=False, unique=True)
    observaciones = db.Column(db.Text)

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "observaciones": self.observaciones
        }

    def __repr__(self):
        return f"<Modalidad {self.nombre}>"


'''from models import db

class Modalidad(db.Model):
    __tablename__ = 'modalidad'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(255), nullable=True)
    observaciones = db.Column(db.Text, nullable=True)'''