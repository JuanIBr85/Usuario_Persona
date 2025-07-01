from models import db


class PreguntaFrecuente(db.Model):
    __tablename__ = 'preguntas_frecuentes'

    id = db.Column(db.Integer, primary_key=True)
    pregunta = db.Column(db.Text, nullable=False)
    respuesta = db.Column(db.Text, nullable=False)
    id_categoria = db.Column(db.Integer, db.ForeignKey(
        'categoria.id'), nullable=False)
    posicion = db.Column(db.Integer, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'pregunta': self.pregunta,
            'respuesta': self.respuesta,
            'id_categoria': self.id_categoria,
            'posicion': self.posicion
        }
