from models import db

class HistorialNavegacion(db.Model):
    __tablename__ = 'historialnavegacion'

    id = db.Column (db.Integer, primary_key = True)
    id_usuario = db.Column (db.Integer)
    id_propuesta_educativa = db.Column (db.Integer)
    fecha_hora_visita = db.Column(db.DateTime)

    def to_dict(self):
        return {
            'id': self.id,
            'id_usuario': self.id_usuario,
            'id_propuesta_educativa': self.id_propuesta_educativa,
            'fecha_hora_visita': self.fecha_hora_visita
        }
    
    def __repr__(self):
        return f'<HistorialNavegacion {self.nombre}>'    