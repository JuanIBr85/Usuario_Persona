from flask import Blueprint, request
from services.area_conocimiento_service import AreaConocimientoService
from schemas.area_conocimiento_schema import AreaConocimientoSchema
from utils.response_utils import make_response, ResponseStatus
from common.decorators.api_access import CacheSettings, api_access

area_bp = Blueprint('area_conocimiento', __name__)

# Obtener todas las areas de conocimiento
@area_bp.route('/', methods=['GET'])
@api_access(is_public=True)
def listar():
    return AreaConocimientoService.get_all()

# Obtener area de conocimiento por ID
@area_bp.route('/<int:id>', methods=['GET'])
@api_access(is_public=False, access_permissions=["creus.admin.ver_area_conocimiento_id"])
def obtener(id):
    return AreaConocimientoService.get_by_id(id)

# Crear area de conocimiento
@area_bp.route('/', methods=['POST'])
@api_access(is_public=False, access_permissions=["creus.admin.crear_area_conocimiento"])
def crear():  
    data = request.get_json()
    schema = AreaConocimientoSchema()
    errores = schema.validate(data)
    if errores:
        return (make_response(ResponseStatus.FAIL, "Datos inválidos", errores), 400,)
    return AreaConocimientoService.create(data)

# Editar area de conocimiento
@area_bp.route('/<int:id>', methods=['PUT'])
@api_access(is_public=False, access_permissions=["creus.admin.editar_area_conocimiento"])
def actualizar(id):  
    data = request.get_json()
    schema = AreaConocimientoSchema()
    errores = schema.validate(data)
    if errores:
        return (make_response(ResponseStatus.FAIL, "Datos inválidos", errores), 400,)
    return AreaConocimientoService.update(id, data)

# Eliminar area de conocimiento
@area_bp.route('/<int:id>', methods=['DELETE'])
@api_access(is_public=False, access_permissions=["creus.admin.eliminar_area_conocimiento"])
def eliminar(id):  
    return AreaConocimientoService.delete(id)




