from models import db

class Noticia(db.Model):
    __tablename__ = 'noticia'

    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(255), nullable=False)
    contenido = db.Column(db.Text, nullable=False)
    fecha_publicacion = db.Column(db.Date, nullable=True)
    estado = db.Column(db.Enum('archivado', 'borrador', 'publicado'), nullable=False, default='borrador')
    destacada = db.Column(db.Boolean, default=False)
    imagen_id = db.Column(db.Integer, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "titulo": self.titulo,
            "contenido": self.contenido,
            "fecha_publicacion": self.fecha_publicacion.isoformat() if self.fecha_publicacion else None,
            "estado": self.estado,
            "destacada": self.destacada,
            "imagen_id": self.imagen_id
        }