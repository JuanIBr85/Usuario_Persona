from models import db


class Imagen(db.Model):
    __tablename__ = 'imagen'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(255), nullable=True)
    url = db.Column(db.Text, nullable=False)
    tipo = db.Column(db.Enum('noticia', 'logo', 'icono', 'carrusel',
                     'propuesta_educativa', name='tipo_imagen'), nullable=False)
    descripcion = db.Column(db.Text)

    id_noticia = db.Column(
        db.Integer, db.ForeignKey('noticia.id'), nullable=True)
    visible = db.Column(db.Boolean, default=True, nullable=False)

    noticia = db.relationship('Noticia', backref='imagenes', lazy='joined')

    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'url': self.url,
            'tipo': self.tipo,
            'descripcion': self.descripcion,

            'id_noticia': self.id_noticia,
            'visible': self.visible
        }
