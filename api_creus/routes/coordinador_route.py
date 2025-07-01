from flask import Blueprint, request
from services.coordinador_service import CoordinadorService
from schemas.coordinador_schema import CoordinadorSchema
from utils.response_utils import make_response, ResponseStatus
from common.decorators.api_access import CacheSettings, api_access

coordinador_bp = Blueprint('coordinador', __name__)
schema = CoordinadorSchema()

# Obtener todos los coordinadores
@coordinador_bp.route('/', methods=['GET'])
@api_access(is_public=False, access_permissions=["creus.admin.ver_coordinador"])
def get_all():
    return CoordinadorService.get_all()

# Obtener coordinador por ID
@coordinador_bp.route('/<int:id>', methods=['GET'])
@api_access(is_public=False, access_permissions=["creus.admin.ver_coordinador_id"])
def get_by_id(id):
    return CoordinadorService.get_by_id(id)

# Crear coordinador
@coordinador_bp.route('/', methods=['POST'])
@api_access(is_public=False, access_permissions=["creus.admin.crear_coordinador"])
def create():
    data = request.get_json()
    errores = schema.validate(data)
    if errores:
        return (make_response(ResponseStatus.FAIL, "Datos inválidos", errores), 400,)
    return CoordinadorService.create(data)

# Editar coordinador
@coordinador_bp.route('/<int:id>', methods=['PUT'])
@api_access(is_public=False, access_permissions=["creus.admin.editar_coordinador"])
def update(id):
    data = request.get_json()
    errores = schema.validate(data)
    if errores:
        return (make_response(ResponseStatus.FAIL, "Datos inválidos", errores), 400,)
    return CoordinadorService.update(id, data)

# Borrado lógico coordinador
@coordinador_bp.route('/<int:id>', methods=['DELETE'])
@api_access(is_public=False, access_permissions=["creus.admin.eliminar_coordinador"])
def delete(id):
    return CoordinadorService.delete(id)
