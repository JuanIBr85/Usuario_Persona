from models import db

class Contacto(db.Model):
    __tablename__ = 'contacto'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), nullable=False)
    telefono = db.Column(db.String(100), nullable=False)
    direccion = db.Column(db.String(255), nullable=False)
    localidad = db.Column(db.String(255), nullable=False)
    provincia = db.Column(db.String(255), nullable=False)
    codigo_postal = db.Column(db.String(20), nullable=False)
    facebook = db.Column(db.String(255), nullable=True)
    instagram = db.Column(db.String(255), nullable=True)
    whatsapp = db.Column(db.String(255), nullable=True)
    google_maps = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'telefono': self.telefono,
            'direccion': self.direccion,
            'localidad': self.localidad,
            'provincia': self.provincia,
            'codigo_postal': self.codigo_postal,
            'facebook': self.facebook,
            'instagram': self.instagram,
            'whatsapp': self.whatsapp,
            'google_maps': self.google_maps
        }

    def __repr__(self):
        return f'<Contacto {self.email}>'