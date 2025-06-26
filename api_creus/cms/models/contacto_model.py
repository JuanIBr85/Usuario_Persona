from models import db

class Contacto(db.Model):
    __tablename__ = 'contacto'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255))
    telefono = db.Column(db.String(100))  
    direccion = db.Column(db.String(255))
    localidad = db.Column(db.String(255))
    provincia = db.Column(db.String(255))
    codigo_postal = db.Column(db.String(20))
    facebook = db.Column(db.String(255))
    instagram = db.Column(db.String(255))
    whatsapp = db.Column(db.String(255))

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
            'whatsapp': self.whatsapp
        }

    def __repr__(self):
        return f'<Contacto {self.email}>'