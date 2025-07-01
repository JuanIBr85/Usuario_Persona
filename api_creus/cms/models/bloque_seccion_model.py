from models import db


class BloqueSeccion(db.Model):
    __tablename__ = 'bloque_seccion'

    id = db.Column(db.Integer, primary_key=True)
    id_seccion = db.Column(db.Integer, db.ForeignKey(
        'seccion.id'), nullable=False)
    tipo = db.Column(
        db.Enum('icono', 'texto', name='tipo_bloque'), nullable=False)
    titulo = db.Column(db.String(255), nullable=False)
    contenido = db.Column(db.Text, nullable=True)
    orden = db.Column(db.Integer, nullable=True)
    visible = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            'id': self.id,
            'id_seccion': self.id_seccion,
            'tipo': self.tipo,
            'titulo': self.titulo,
            'contenido': self.contenido,
            'orden': self.orden,
            'visible': self.visible
        }
