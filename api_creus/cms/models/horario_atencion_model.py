from models import db

class HorarioAtencion(db.Model):
    __tablename__ = 'horario_atencion'

    id = db.Column(db.Integer, primary_key=True)
    dia = db.Column(db.String(255), nullable=False)
    hora_inicio = db.Column(db.Time, nullable=False)
    hora_cierre = db.Column(db.Time, nullable=False)
    visible = db.Column(db.Boolean, nullable=False, default=True)

    def to_dict(self):
        return {
            'id':self.id,
            'dia':self.dia,
            'hora_inicio': self.hora_inicio.strftime("%H:%M") if self.hora_inicio else None,
            'hora_cierre': self.hora_cierre.strftime("%H:%M") if self.hora_cierre else None,
            'visible':self.visible,
        }