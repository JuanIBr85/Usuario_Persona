from flask import Blueprint, request
from services.tipo_propuesta_service import TipoPropuestaService
from schemas.tipo_propuesta_schema import TipoPropuestaSchema
from utils.response_utils import make_response, ResponseStatus
from common.decorators.api_access import CacheSettings, api_access 

tipo_bp = Blueprint('tipo_propuesta', __name__)

# Obtener todas los tipos de propuestas
@tipo_bp.route('/', methods=['GET'])
@api_access(is_public=True)
def listar():
    return TipoPropuestaService.get_all()

# Obtener tipo de propuesta por ID
@tipo_bp.route('/<int:id>', methods=['GET'])
@api_access(is_public=False, access_permissions=["creus.admin.ver_tipo_propuesta_id"])
def obtener(id):
    return TipoPropuestaService.get_by_id(id)

# Crear tipo de propuesta
@tipo_bp.route('/', methods=['POST'])
@api_access(is_public=False, access_permissions=["creus.admin.crear_tipo_propuesta"])
def crear():
    data = request.get_json()
    schema = TipoPropuestaSchema()
    errores = schema.validate(data)
    if errores:
        return (make_response(ResponseStatus.FAIL, "Datos inválidos", errores), 400,)
    return TipoPropuestaService.create(data)

# Editar tipo de propuesta
@tipo_bp.route('/<int:id>', methods=['PUT'])
@api_access(is_public=False, access_permissions=["creus.admin.editar_tipo_propuesta"])
def actualizar(id):
    data = request.get_json()
    schema = TipoPropuestaSchema()
    errores = schema.validate(data)
    if errores:
        return (make_response(ResponseStatus.FAIL, "Datos inválidos", errores), 400,)
    return TipoPropuestaService.update(id, data)

# Eliminar tipo de propuesta
@tipo_bp.route('/<int:id>', methods=['DELETE'])
@api_access(is_public=False, access_permissions=["creus.admin.eliminar_tipo_propuesta"])
def eliminar(id):
    return TipoPropuestaService.delete(id)

