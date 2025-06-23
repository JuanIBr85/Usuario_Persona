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



'''from models import db
from datetime import datetime
import os

class Archivo(db.Model):
    __tablename__ = 'archivo'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(255), nullable=False)
    ruta = db.Column(db.String(512), nullable=False)
    tipo = db.Column(db.String(100))
    tamaño = db.Column(db.Integer)  # Tamaño en bytes
    id_convenio = db.Column(db.Integer, db.ForeignKey('convenio.id'), nullable=True)
    id_institucion = db.Column(db.Integer, db.ForeignKey('institucion.id'), nullable=True)
    fecha_subida = db.Column(db.DateTime, server_default=db.func.now())
    subido_por = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=True)
    activo = db.Column(db.Boolean, default=True)

    # Relaciones
    convenio = db.relationship('Convenio', backref='archivos')
    institucion = db.relationship('Institucion', backref='archivos')

    def __init__(self, **kwargs):
        super(Archivo, self).__init__(**kwargs)

    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'ruta': self.ruta,
            'tipo': self.tipo,
            'tamaño': self.tamaño,
            'id_convenio': self.id_convenio,
            'id_institucion': self.id_institucion,
            'fecha_subida': self.fecha_subida.isoformat() if self.fecha_subida else None,
            'subido_por': self.subido_por,
            'url_descarga': f"/api/archivos/{self.id}/descargar" if self.id else None
        }

    def __repr__(self):
        return f'<Archivo {self.nombre}>'

    @property
    def extension(self):
        return os.path.splitext(self.nombre)[1].lower() if self.nombre else ''

    @property
    def es_imagen(self):
        return self.extension in ['.jpg', '.jpeg', '.png', '.gif', '.bmp']

    @property
    def es_pdf(self):
        return self.extension == '.pdf'

    @property
    def es_documento(self):
        return self.extension in ['.doc', '.docx', '.odt', '.txt', '.rtf']

    @property
    def es_planilla(self):
        return self.extension in ['.xls', '.xlsx', '.ods', '.csv']'''
