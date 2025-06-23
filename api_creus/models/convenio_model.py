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




'''from models import db
from datetime import datetime

class Convenio(db.Model):
    __tablename__ = 'convenio'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(255), nullable=False)
    descripcion = db.Column(db.Text)
    fecha_inicio = db.Column(db.Date, nullable=False)
    fecha_fin = db.Column(db.Date)
    id_institucion = db.Column(db.Integer, db.ForeignKey('institucion.id'), nullable=False)
    activo = db.Column(db.Boolean, default=True)
    fecha_creacion = db.Column(db.DateTime, server_default=db.func.now())
    fecha_actualizacion = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    # Relaciones
    institucion = db.relationship('Institucion', backref='convenios')

    def __init__(self, **kwargs):
        super(Convenio, self).__init__(**kwargs)

    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'descripcion': self.descripcion,
            'fecha_inicio': self.fecha_inicio.isoformat() if self.fecha_inicio else None,
            'fecha_fin': self.fecha_fin.isoformat() if self.fecha_fin else None,
            'id_institucion': self.id_institucion,
            'activo': self.activo,
            'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            'fecha_actualizacion': self.fecha_actualizacion.isoformat() if self.fecha_actualizacion else None
        }

    def __repr__(self):
        return f'<Convenio {self.nombre}>'
        '''
