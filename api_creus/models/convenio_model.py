from models import db

class Convenio(db.Model):
    __tablename__ = 'convenio'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(255), nullable=False)
    descripcion = db.Column(db.Text, nullable=False)
    fecha_inicio = db.Column(db.DateTime, nullable=False)
    fecha_fin = db.Column(db.DateTime, nullable=False)
    id_archivo = db.Column(db.Integer, db.ForeignKey('archivo.id'), nullable=True)
    id_institucion = db.Column(db.Integer, db.ForeignKey('institucion.id'), nullable=False)
    id_estado = db.Column(db.Integer, db.ForeignKey('estado.id'), nullable=False)
    observaciones = db.Column(db.Text)

    # Relaciones
    archivo = db.relationship('Archivo', backref='convenios', lazy=True)
    institucion = db.relationship('Institucion', backref='convenios', lazy='joined')
    estado = db.relationship('Estado', backref='convenios', lazy='joined')

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "descripcion": self.descripcion,
            "fecha_inicio": self.fecha_inicio.isoformat(),
            "fecha_fin": self.fecha_fin.isoformat(),
            "id_archivo": self.id_archivo,
            "id_institucion": self.id_institucion,
            "id_estado": self.id_estado,
            "observaciones": self.observaciones
        }
    
    def __repr__(self):
        return f"<Convenio {self.nombre}>"


