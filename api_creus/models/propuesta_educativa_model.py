from models import db

class PropuestaEducativa(db.Model):
    __tablename__ = 'propuesta_educativa'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False, unique=True)
    descripcion = db.Column(db.Text, nullable=True)
    duracion = db.Column(db.String(255), nullable=False)
    titulo_otorgado = db.Column(db.String(255), nullable=False)
    requisitos_ingreso = db.Column(db.Text, nullable=False)
    perfil_egresado = db.Column(db.Text, nullable=False)
    salida_laboral = db.Column(db.Text, nullable=False)

    # Claves foráneas
    id_modalidad = db.Column(db.Integer, db.ForeignKey('modalidad.id'), nullable=False)
    id_convenio = db.Column(db.Integer, db.ForeignKey('convenio.id'), nullable=True)
    id_tipo_propuesta = db.Column(db.Integer, db.ForeignKey('tipo_propuesta.id'), nullable=False)
    id_estado = db.Column(db.Integer, db.ForeignKey('estado.id'), nullable=False)
    id_area_conocimiento = db.Column(db.Integer, db.ForeignKey('area_conocimiento.id'), nullable=False)
    id_titulo_certificacion = db.Column(db.Integer, db.ForeignKey('titulo_certificacion.id'), nullable=False)

    observaciones = db.Column(db.Text, nullable=True)

    # Relaciones
    modalidad = db.relationship('Modalidad', backref='propuestas', lazy='joined')
    convenio = db.relationship('Convenio', backref='propuestas', lazy=True) 
    tipo_propuesta = db.relationship('TipoPropuesta', backref='propuestas', lazy='joined')
    estado = db.relationship('Estado', backref='propuestas', lazy='joined')
    area_conocimiento = db.relationship('AreaConocimiento', backref='propuestas', lazy='joined')
    titulo_certificacion = db.relationship('TituloCertificacion', backref='propuestas', lazy='joined')

    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'descripcion': self.descripcion,
            'duracion': self.duracion,
            'titulo_otorgado': self.titulo_otorgado,
            'requisitos_ingreso': self.requisitos_ingreso,
            'perfil_egresado': self.perfil_egresado,
            'salida_laboral': self.salida_laboral,
            'id_modalidad': self.id_modalidad,
            'id_convenio': self.id_convenio,
            'id_tipo_propuesta': self.id_tipo_propuesta,
            'id_estado': self.id_estado,
            'id_area_conocimiento': self.id_area_conocimiento,
            'id_titulo_certificacion': self.id_titulo_certificacion,
            'observaciones': self.observaciones
        }

    def __repr__(self):
        return f'<PropuestaEducativa {self.nombre}>'




"""from models import db

class PropuestaEducativa(db.Model):
    __tablename__ = 'propuesta_educativa'
    
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text)
    duracion = db.Column(db.String(255))
    titulo_otorgado = db.Column(db.String(255))
    requisitos_ingreso = db.Column(db.Text)
    perfil_egresado = db.Column(db.Text)
    salida_laboral = db.Column(db.Text)

    # Claves foráneas
    id_modalidad = db.Column(db.Integer, db.ForeignKey('modalidad.id'), nullable=True)
    id_convenio = db.Column(db.Integer, db.ForeignKey('convenio.id'), nullable=True)
    id_tipo_propuesta = db.Column(db.Integer, db.ForeignKey('tipo_propuesta.id'), nullable=True)
    id_estado = db.Column(db.Integer, db.ForeignKey('estado.id'), nullable=True)
    id_area_conocimiento = db.Column(db.Integer, db.ForeignKey('area_conocimiento.id'), nullable=True)
    id_titulo_certificacion = db.Column(db.Integer, db.ForeignKey('titulo_certificacion.id'), nullable=True)

    observaciones = db.Column(db.Text)

    # Relaciones 
    modalidad = db.relationship('Modalidad', backref='propuestas', lazy=True)
    convenio = db.relationship('Convenio', backref='propuestas', lazy=True)
    tipo_propuesta = db.relationship('TipoPropuesta', backref='propuestas', lazy=True)
    estado = db.relationship('Estado', backref='propuestas', lazy=True)
    area_conocimiento = db.relationship('AreaConocimiento', backref='propuestas', lazy=True)
    titulo_certificacion = db.relationship('TituloCertificacion', backref='propuestas', lazy=True)

    
    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'descripcion': self.descripcion,
            'duracion': self.duracion,
            'titulo_otorgado': self.titulo_otorgado,
            'requisitos_ingreso': self.requisitos_ingreso,
            'perfil_egresado': self.perfil_egresado,
            'salida_laboral': self.salida_laboral,
            'id_modalidad': self.id_modalidad,
            'id_convenio': self.id_convenio,
            'id_tipo_propuesta': self.id_tipo_propuesta,
            'id_estado': self.id_estado,
            'id_area_conocimiento': self.id_area_conocimiento,
            'id_titulo_certificacion': self.id_titulo_certificacion,
            'observaciones': self.observaciones
        }
    
    def __repr__(self):
        return f'<propuestaeducativa {self.nombre}>' """