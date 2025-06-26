from models import db

class Preinscripcion(db.Model):
    __tablename__ = 'preinscripcion'

    id = db.Column (db.Integer, primary_key = True)
    id_usuario = db.Column (db.Integer)
    id_cohorte = db.Column (db.Integer, db.ForeignKey('cohorte.id'), nullable=False)
    fecha_hora_preinscripcion = db.Column (db.DateTime)
    id_estado = db.Column (db.Integer, db.ForeignKey('estado.id'), nullable=False)
    observaciones = db.Column (db.Text)

    def to_dict(self):
        return {
            'id': self.id,
            'id_usuario': self.id_usuario,
            'id_cohorte': self.id_cohorte,
            'fecha_hora_preinscripcion': self.fecha_hora_preinscripcion,
            'id_estado': self.id_estado,
            'observaciones': self.observaciones
        }
    

    #    def __repr__(self):
    #    return f'<Preinscripcion {self.id}>'
    def __repr__(self):
        return f'<Preinscripcion {self.nombre}>'