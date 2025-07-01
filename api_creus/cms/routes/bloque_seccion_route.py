from flask import Blueprint, request
from cms.services.bloque_seccion_service import BloqueSeccionService
from cms.schemas.bloque_seccion_schema import BloqueSeccionSchema
from utils.response_utils import make_response, ResponseStatus
from common.decorators.api_access import CacheSettings, api_access

bloque_bp = Blueprint('bloque', __name__)

# Obtener todos los bloques

@bloque_bp.route('/', methods=['GET'])
@api_access(is_public=True)
def get_all():
    return BloqueSeccionService.get_all()

# Obtener los bloques visibles por sección

@bloque_bp.route('/seccion/<int:id_seccion>', methods=['GET'])
@api_access(is_public=False, access_permissions=["creus.admin.ver_bloque_seccion_id"])
def get_by_seccion(id_seccion):
    return BloqueSeccionService.get_by_seccion(id_seccion)

# Crear un nuevo bloque

@bloque_bp.route('/', methods=['POST'])
@api_access(is_public=False, access_permissions=["creus.admin.crear_bloque_seccion"])
def create():
    schema = BloqueSeccionSchema()
    data = request.get_json()
    errores = schema.validate(data)
    if errores:
        return (make_response(ResponseStatus.FAIL, "Datos inválidos", errores), 400,)
    return BloqueSeccionService.create(data)

# Actualizar un bloque

@bloque_bp.route('/<int:id>', methods=['PUT'])
@api_access(is_public=False, access_permissions=["creus.admin.editar_bloque_seccion"])
def update(id):
    schema_with_context = BloqueSeccionSchema()
    schema_with_context.context = {'id': id}
    data = request.get_json()
    errores = schema_with_context.validate(data)
    if errores:
        return (make_response(ResponseStatus.FAIL, "Datos inválidos", errores), 400,)
    return BloqueSeccionService.update(id, data)

# Eliminar un bloque

@bloque_bp.route('/<int:id>', methods=['DELETE'])
@api_access(is_public=False, access_permissions=["creus.admin.borrar_bloque_seccion"])
def delete(id):
    return BloqueSeccionService.delete(id)
