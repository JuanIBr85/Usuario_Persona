from flask import Blueprint, request
from services.propuesta_educativa_service import PropuestaEducativaService
from schemas.propuesta_educativa_schema import PropuestaEducativaSchema
from utils.response_utils import make_response, ResponseStatus
from common.decorators.api_access import CacheSettings, api_access

propuesta_bp = Blueprint('propuestas', __name__)
schema = PropuestaEducativaSchema()

# Obtener todas las propuestas educativas
@propuesta_bp.route('/', methods=['GET'])
@api_access(is_public=False, access_permissions=["creus.admin.ver_propuesta_educativa"])
def listar_propuestas():
    return PropuestaEducativaService.get_all()

# Obtener una propuesta educativa por ID
@propuesta_bp.route('/<int:id>', methods=['GET'])
@api_access(is_public=False, access_permissions=["creus.admin.ver_propuesta_educativa_id"])
def obtener_propuesta(id):
    return PropuestaEducativaService.get_by_id(id)

# Obtener propuestas educativas activas
@propuesta_bp.route('/activas', methods=['GET'])
@api_access(is_public=True)
def listar_activas():
    return PropuestaEducativaService.get_activas()

# Obtener propuestas educativas inactivas
@propuesta_bp.route('/inactivas', methods=['GET'])
@api_access(is_public=False, access_permissions=["creus.admin.ver_propuesta_educativa_inactiva"])
def listar_inactivas():
    return PropuestaEducativaService.get_inactivas()

# Crear nueva propuesta educativa
@propuesta_bp.route('/', methods=['POST'])
@api_access(is_public=False, access_permissions=["creus.admin.crear_propuesta_educativa"])
def crear_propuesta():  
    data = request.get_json()
    errores = schema.validate(data)
    if errores:
        return (make_response(ResponseStatus.FAIL, "Datos inválidos", errores), 400,)
    return PropuestaEducativaService.create(data)

# Editar una propuesta educativa
@propuesta_bp.route('/<int:id>', methods=['PUT'])
@api_access(is_public=False, access_permissions=["creus.admin.editar_propuesta_educativa"])
def actualizar_propuesta(id):  
    data = request.get_json()
    errores = schema.validate(data)
    if errores:
        return (make_response(ResponseStatus.FAIL, "Datos inválidos", errores), 400,)
    return PropuestaEducativaService.update(id, data)

# Borrado lógico propuesta educativa
@propuesta_bp.route('/<int:id>', methods=['DELETE'])
@api_access(is_public=False, access_permissions=["creus.admin.eliminar_propuesta_educativa"])
def eliminar_propuesta(id):  
    return PropuestaEducativaService.delete(id)