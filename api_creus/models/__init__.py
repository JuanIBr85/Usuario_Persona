from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()

# Importar modelos para que se registren al hacer db.create_all()
from .titulo_certificacion_model import TituloCertificacion
from .tipo_propuesta_model import TipoPropuesta
from .area_conocimiento_model import AreaConocimiento
from .archivo_model import Archivo
from .convenio_model import Convenio
from .modalidad_model import Modalidad
from .estado_model import Estado
from .cohorte_model import Cohorte
from .institucion_model import Institucion
from .modalidad_model import Modalidad
from .sede_creus_model import SedeCreus
from .coordinador_model import Coordinador
from .estado_model import Estado
from .propuesta_educativa_model import PropuestaEducativa
from .egresado_model import Egresado