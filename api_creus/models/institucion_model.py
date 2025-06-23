from models import db

class Institucion(db.Model):
    __tablename__ = 'institucion'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(255), nullable=False, unique=True)
    email = db.Column(db.Text, nullable=False)
    telefono = db.Column(db.Integer)
    pagina_web = db.Column(db.Text)
    calle = db.Column(db.String(255), nullable=False)
    numero = db.Column(db.Integer, nullable=False)
    ciudad = db.Column(db.String(255), nullable=False)
    provincia = db.Column(db.String(255), nullable=False)
    pais = db.Column(db.String(255), nullable=False)
    codigo_postal = db.Column(db.String(20))
    id_estado = db.Column(db.Integer, db.ForeignKey('estado.id'), nullable=False)
    observaciones = db.Column(db.Text)

    # Relaciones
    estado = db.relationship('Estado', backref='instituciones', lazy='joined')

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "email": self.email,
            "telefono": self.telefono,
            "pagina_web": self.pagina_web,
            "calle": self.calle,
            "numero": self.numero,
            "ciudad": self.ciudad,
            "provincia": self.provincia,
            "pais": self.pais,
            "codigo_postal": self.codigo_postal,
            "id_estado": self.id_estado,
            "observaciones": self.observaciones
        }
    
    def __repr__(self):
        return f"<Institucion {self.nombre}>"



'''from datetime import datetime
from models import db

class Institucion(db.Model):

    __tablename__ = 'institucion'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255))
    telefono = db.Column(db.String(20))
    pagina_web = db.Column(db.String(255))
    calle = db.Column(db.String(255))
    numero = db.Column(db.Integer)
    ciudad = db.Column(db.String(100))
    provincia = db.Column(db.String(100))
    pais = db.Column(db.String(100))
    codigo_postal = db.Column(db.String(20))
    id_estado = db.Column(db.Integer, db.ForeignKey('estado.id'), nullable=False)
    observaciones = db.Column(db.Text)
#   fecha_creacion = db.Column(db.DateTime, server_default=db.func.now())
#   fecha_actualizacion = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    def __init__(self, **kwargs):
        """
        Inicializa una nueva instancia de la clase Institucion.
        
        Args:
            **kwargs: Diccionario con los atributos de la institución.
        """
        super(Institucion, self).__init__(**kwargs)

    def __repr__(self):
        """
        Representación en cadena de la instancia de la institución.
        
        Returns:
            str: Representación en cadena del nombre de la institución.
        """
        return f'<Institucion {self.nombre} (ID: {self.id})>'

    def to_dict(self):
        """
        Convierte la instancia de la institución a un diccionario.
        
        Returns:
            dict: Diccionario con los atributos de la institución.
        """
        return {
            'id': self.id,
            'nombre': self.nombre,
            'email': self.email,
            'telefono': self.telefono,
            'pagina_web': self.pagina_web,
            'direccion': {
                'calle': self.calle,
                'numero': self.numero,
                'ciudad': self.ciudad,
                'provincia': self.provincia,
                'pais': self.pais,
                'codigo_postal': self.codigo_postal
            },
            'id_estado': self.id_estado,
            'observaciones': self.observaciones,
        #    'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None,
        #    'fecha_actualizacion': self.fecha_actualizacion.isoformat() if self.fecha_actualizacion else None
        }'''