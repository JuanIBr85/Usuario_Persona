from flask import Blueprint, request
from services.propuesta_educativa_service import PropuestaEducativaService
from schemas.propuesta_educativa_schema import PropuestaEducativaSchema
from routes.auth import get_token_required 
from utils.response_utils import error_response

propuesta_bp = Blueprint('propuestas', __name__)

token_required = get_token_required()

# Obtener todas las propuestas
@propuesta_bp.route('/', methods=['GET'])
def listar_propuestas():
    return PropuestaEducativaService.get_all()


# Obtener una propuesta por ID
@propuesta_bp.route('/<int:id>', methods=['GET'])
def obtener_propuesta(id):
    return PropuestaEducativaService.get_by_id(id)


# Crear una propuesta educativa
@propuesta_bp.route('/', methods=['POST'])
#@token_required  
#def crear_propuesta(current_user):
def crear_propuesta():

    data = request.get_json()
    
    # Validación con schema
    schema = PropuestaEducativaSchema()
    errores = schema.validate(data)
    if errores:
        return error_response("Datos inválidos", errores)

    return PropuestaEducativaService.create(data)


# Actualizar una propuesta educativa
@propuesta_bp.route('/<int:id>', methods=['PUT'])
#@token_required
#def actualizar_propuesta(current_user, id):
def actualizar_propuesta(id):
    data = request.get_json()

    schema = PropuestaEducativaSchema()
    errores = schema.validate(data)
    if errores:
        return error_response("Datos inválidos", errores)

    return PropuestaEducativaService.update(id, data)


# Eliminar lógicamente una propuesta (estado = Inactiva)
@propuesta_bp.route('/<int:id>', methods=['DELETE'])
#@token_required
#def eliminar_propuesta(current_user, id):
def eliminar_propuesta(id):
    return PropuestaEducativaService.delete(id)