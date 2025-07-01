from models import db

class Archivo(db.Model):
    __tablename__ = 'archivo'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(255), nullable=False)
    url_archivo = db.Column(db.Text, nullable=False)
    id_propuesta_educativa = db.Column(db.Integer, db.ForeignKey('propuesta_educativa.id'), nullable=False)
    observaciones = db.Column(db.Text)

    # Relaciones
    propuesta_educativa = db.relationship('PropuestaEducativa', backref='archivos', lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "url_archivo": self.url_archivo,
            "id_propuesta_educativa": self.id_propuesta_educativa,
            "observaciones": self.observaciones
        }
    
    def __repr__(self):
        return f"<Archivo {self.nombre}>"


