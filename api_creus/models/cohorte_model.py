from models import db

class Cohorte(db.Model):
    __tablename__ = 'cohorte'

    id = db.Column(db.Integer, primary_key=True)
    id_propuesta_educativa = db.Column(db.Integer, db.ForeignKey('propuesta_educativa.id'), nullable=False)
    numero_cohorte = db.Column(db.Integer, nullable=False)
    anio_inicio = db.Column(db.Integer, nullable=False)
    mes_inicio = db.Column(db.String(255), nullable=False)
    fecha_inicio_preinscripcion = db.Column(db.DateTime, nullable=False)
    fecha_cierre_preinscripcion = db.Column(db.DateTime, nullable=False)
    fecha_inicio_cursado = db.Column(db.DateTime, nullable=False)
    fecha_estimada_finalizacion = db.Column(db.DateTime, nullable=False)
    cupos_maximos = db.Column(db.Integer, nullable=False)
    cupos_ocupados = db.Column(db.Integer, nullable=False, default=0)
    id_estado = db.Column(db.Integer, db.ForeignKey('estado.id'), nullable=False)
    id_coordinador = db.Column(db.Integer, db.ForeignKey('coordinador.id'), nullable=False)
    id_sede_creus = db.Column(db.Integer, db.ForeignKey('sede_creus.id'), nullable=False)
    observaciones = db.Column(db.Text)

    # Relaciones
    propuesta_educativa = db.relationship('PropuestaEducativa', backref='cohortes', lazy='joined')
    estado = db.relationship('Estado', backref='cohortes', lazy='joined')
    coordinador = db.relationship('Coordinador', backref='cohortes', lazy='joined')
    sede_creus = db.relationship('SedeCreus', backref='cohortes', lazy='joined')

    def to_dict(self):
        return {
            "id": self.id,
            "id_propuesta_educativa": self.id_propuesta_educativa,
            "numero_cohorte": self.numero_cohorte,
            "anio_inicio": self.anio_inicio,
            "mes_inicio": self.mes_inicio,
            "fecha_inicio_preinscripcion": self.fecha_inicio_preinscripcion.isoformat(),
            "fecha_cierre_preinscripcion": self.fecha_cierre_preinscripcion.isoformat(),
            "fecha_inicio_cursado": self.fecha_inicio_cursado.isoformat(),
            "fecha_estimada_finalizacion": self.fecha_estimada_finalizacion.isoformat(),
            "cupos_maximos": self.cupos_maximos,
            "cupos_ocupados": self.cupos_ocupados,
            "id_estado": self.id_estado,
            "id_coordinador": self.id_coordinador,
            "id_sede_creus": self.id_sede_creus,
            "observaciones": self.observaciones
        }
    
    def __repr__(self):
        return f"<Cohorte {self.numero_cohorte} - {self.anio_inicio}>"




'''from models import db

class Cohorte(db.Model):
    __tablename__ = 'cohorte'

    id = db.Column(db.Integer, primary_key=True)
    id_propuesta_educativa = db.Column(db.Integer, db.ForeignKey('propuesta_educativa.id'), nullable=True)
    numero_cohorte = db.Column(db.Integer, nullable=True)
    anio_inicio = db.Column(db.Integer, nullable=True)
    mes_inicio = db.Column(db.String(255), nullable=True)

    fecha_inicio_preinscripcion = db.Column(db.DateTime, nullable=True)
    fecha_cierre_preinscripcion = db.Column(db.DateTime, nullable=True)
    fecha_inicio_cursado = db.Column(db.DateTime, nullable=True)
    fecha_estimada_finalizacion = db.Column(db.DateTime, nullable=True)

    cupos_maximos = db.Column(db.Integer, nullable=True)
    cupos_ocupados = db.Column(db.Integer, nullable=True)

    id_estado = db.Column(db.Integer, db.ForeignKey('estado.id'), nullable=True)
    observaciones = db.Column(db.Text, nullable=True)

    id_coordinador = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=True)
    id_sede_creus = db.Column(db.Integer, db.ForeignKey('sede_creus.id'), nullable=True)

    # Relaciones opcionales
    propuesta_educativa = db.relationship('PropuestaEducativa', backref='cohortes', lazy=True)
    estado = db.relationship('Estado', backref='cohortes', lazy=True)
    #coordinador = db.relationship('Usuario', backref='cohortes', lazy=True)
    #sede_creus = db.relationship('SedeCreus', backref='cohortes', lazy=True)'''