from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()

# Importar modelos para que se registren al hacer db.create_all()
from .contacto_model import Contacto
from .horario_atencion_model import HorarioAtencion
from .pagina_inicio_model import PaginaInicio
from .publicacion_propuesta_model import PublicacionPropuesta
from .categoria_model import Categoria
from .preguntas_frecuentes_model import PreguntaFrecuente