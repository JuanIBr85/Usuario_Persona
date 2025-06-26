from flask import Blueprint, request
from models.institucion_model import Institucion
from models import db
from routes.auth import get_token_required
from services.institucion_service import InstitucionService
from schemas.institucion_schema import InstitucionSchema
from utils.response_utils import make_response, ResponseStatus

institucion_bp = Blueprint('institucion', __name__)

token_required = get_token_required

# Traer todas las instituciones
@institucion_bp.route('/', methods=['GET'])
def get_all_instituciones():
    return InstitucionService.get_all()

# Traer institución por ID
@institucion_bp.route('/<int:id>', methods=['GET'])
def get_by_id(id):
    return InstitucionService.get_by_id(id)

# Traer instituciones activas
@institucion_bp.route('/activas', methods=['GET'])
def get_activas():
    return InstitucionService.get_activas()

# Crear institución
@institucion_bp.route('/', methods=['POST'])
def create_institucion():
    data = request.get_json()

    # Validación con schema
    schema = InstitucionSchema()
    errores = schema.validate(data)
    if errores:
        return make_response(ResponseStatus.FAIL, "Datos inválidos", errores)
    
    return InstitucionService.create(data)

# Actualizar institución
@institucion_bp.route('/<int:id>', methods=['PUT'])
def update_institucion(id):
    data = request.get_json()

    schema = InstitucionSchema()
    errores = schema.validate(data)
    if errores:
        return make_response(ResponseStatus.FAIL, "Datos inválidos", errores)
    
    return InstitucionService.update(id, data)

# Eliminar (borrado lógico) institución
@institucion_bp.route('/<int:id>', methods=['DELETE'])
def delete_institucion(id):
    return InstitucionService.delete(id)