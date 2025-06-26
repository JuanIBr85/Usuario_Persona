from flask import Blueprint, request
from services.propuesta_educativa_service import PropuestaEducativaService
from schemas.propuesta_educativa_schema import PropuestaEducativaSchema
from utils.response_utils import make_response, ResponseStatus
# from routes.auth import get_token_required

propuesta_bp = Blueprint('propuestas', __name__)
schema = PropuestaEducativaSchema()
# token_required = get_token_required()

# Obtener todas las propuestas
@propuesta_bp.route('/', methods=['GET'])
def listar_propuestas():
    return PropuestaEducativaService.get_all()

# Obtener una propuesta por ID
@propuesta_bp.route('/<int:id>', methods=['GET'])
def obtener_propuesta(id):
    return PropuestaEducativaService.get_by_id(id)

# Obtener propuestas activas
@propuesta_bp.route('/activas', methods=['GET'])
def listar_activas():
    return PropuestaEducativaService.get_activas()

# Obtener propuestas inactivas
@propuesta_bp.route('/inactivas', methods=['GET'])
def listar_inactivas():
    return PropuestaEducativaService.get_inactivas()

# Crear nueva propuesta
@propuesta_bp.route('/', methods=['POST'])
# @token_required
def crear_propuesta():  # def crear_propuesta(current_user):
    data = request.get_json()
    errores = schema.validate(data)
    if errores:
        return make_response(ResponseStatus.FAIL, "Datos inválidos", errores)
    return PropuestaEducativaService.create(data)

# Actualizar una propuesta existente
@propuesta_bp.route('/<int:id>', methods=['PUT'])
# @token_required
def actualizar_propuesta(id):  # def actualizar_propuesta(current_user, id):
    data = request.get_json()
    errores = schema.validate(data)
    if errores:
        return make_response(ResponseStatus.FAIL, "Datos inválidos", errores)
    return PropuestaEducativaService.update(id, data)

# Borrado lógico
@propuesta_bp.route('/<int:id>', methods=['DELETE'])
# @token_required
def eliminar_propuesta(id):  # def eliminar_propuesta(current_user, id):
    return PropuestaEducativaService.delete(id)