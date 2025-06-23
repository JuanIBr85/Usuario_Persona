from models import db

class PaginaInicio(db.Model):
    __tablename__ = 'pagina_inicio'

    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(255))
    subtitulo = db.Column(db.Text)
    slogan = db.Column(db.Text)

    def to_dict(self):
        return {
            'id': self.id,
            'titulo': self.titulo,
            'subtitulo': self.subtitulo,
            'slogan': self.slogan,
        }