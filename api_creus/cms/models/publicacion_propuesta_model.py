from models import db

class PublicacionPropuesta(db.Model):
    __tablename__ = 'publicacion_propuesta'

    id = db.Column(db.Integer, primary_key=True)
    id_propuesta_educativa = db.Column(db.Integer, nullable=False)
    destacada = db.Column(db.Boolean, default=False)
    posicion = db.Column(db.Integer, nullable=True)
    visible = db.Column(db.Boolean, nullable=False, default=False)

    def to_dict(self):
        return {
            'id': self.id,
            'id_propuesta_educativa': self.id_propuesta_educativa,
            'destacada': self.destacada,
            'posicion': self.posicion,
            'visible': self.visible
        }