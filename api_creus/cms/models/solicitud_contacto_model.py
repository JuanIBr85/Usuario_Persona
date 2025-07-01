from models import db
from datetime import datetime

class SolicitudContacto(db.Model):
    __tablename__ = 'solicitud_contacto'
    
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    apellido = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    telefono = db.Column(db.String(20), nullable=True)
    localidad = db.Column(db.String(100), nullable=True)
    mensaje = db.Column(db.Text, nullable=False)
    respondida = db.Column(db.Boolean, default=False, nullable=False)
    visible = db.Column(db.Boolean, default=True, nullable=False)
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    fecha_respuesta = db.Column(db.DateTime, nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'apellido': self.apellido,
            'email': self.email,
            'telefono': self.telefono,
            'localidad': self.localidad,
            'mensaje': self.mensaje,
            'respondida': self.respondida,
            'visible': self.visible,
            'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            'fecha_respuesta': self.fecha_respuesta.isoformat() if self.fecha_respuesta else None
        }