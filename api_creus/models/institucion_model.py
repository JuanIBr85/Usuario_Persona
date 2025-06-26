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


