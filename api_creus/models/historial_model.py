from models import db

class Historial(db.Model):
    __tablename__ = 'historial'

    id = db.Column(db.Integer, primary_key = True)
    id_registro = db.Column(db.Integer)
    nombre_tabla = db.Column (db.String(255))
    fecha_hora = db.Column (db.DateTime)
    accion = db.Column (db.String(255))
    id_usuario = db.Column (db.Integer)
    observaciones = db.Column (db.Text)


    def to_dict(self):
        return {
            'id': self.id,
            'id_registro': self.id_registro,
            'nombre_tabla': self.nombre_tabla,
            'fecha_hora': self.fecha_hora,
            'accion': self.accion,
            'id_usuario': self.id_usuario,
            'observaciones': self.observaciones
        }
    
    def __repr__(self):
        return f'<Historial {self.nombre}>'