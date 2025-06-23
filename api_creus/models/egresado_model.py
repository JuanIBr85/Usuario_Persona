from models import db

class Egresado (db.Model):
    __tablename__ = 'egresado'

    id = db.Column (db.Integer, primary_key = True)
    id_persona = db.Column(db.Integer)
    fecha_egreso = db.Column (db.DateTime)
    id_cohorte = db.Column (db.Integer, db.ForeignKey('cohorte.id'), nullable=False)
    testimonio = db.Column (db.Text)
    id_estado = db.Column (db.Integer, db.ForeignKey('estado.id'), nullable=False)
    observaciones = db.Column (db.Text)

    def to_dict(self):
        return {
            'id': self.id,
            'id_persona': self.id_persona,
            'fecha_egreso': self.fecha_egreso,
            'id_cohorte': self.id_cohorte,
            'testimonio': self.testimonio,
            'id_estado': self.id_estado,
            'observaciones': self.observaciones
        }
    
    def __repr__(self):
        return f'<Egresado {self.nombre}>'