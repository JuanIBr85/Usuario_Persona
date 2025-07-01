from flask import Blueprint, request
from cms.services.seccion_service import SeccionService
from cms.schemas.seccion_schema import SeccionSchema
from utils.response_utils import make_response, ResponseStatus
from common.decorators.api_access import CacheSettings, api_access


seccion_bp = Blueprint('seccion', __name__)

# Obtener todas las secciones visibles
@seccion_bp.route('/', methods=['GET'])
@api_access(is_public=True)
def get_visibles():
    return SeccionService.get_all_visibles()

# Obtener todas las secciones (admin)
@seccion_bp.route('/todos', methods=['GET'])
@api_access(is_public=False, access_permissions=["creus.admin.ver_seccion"])
def get_all():
    return SeccionService.get_all()

# Crear una nueva sección
@seccion_bp.route('/', methods=['POST'])
@api_access(is_public=False, access_permissions=["creus.admin.crear_seccion"])
def create():
    schema = SeccionSchema()
    data = request.get_json()
    errores = schema.validate(data)
    if errores:
        return (make_response(ResponseStatus.FAIL, "Datos inválidos", errores), 400,)
    return SeccionService.create(data)

# Actualizar una sección
@seccion_bp.route('/<int:id>', methods=['PUT'])
@api_access(is_public=False, access_permissions=["creus.admin.editar_seccion"])
def update(id):
    schema_with_context = SeccionSchema()
    schema_with_context.context = {'id': id}
    data = request.get_json()
    errores = schema_with_context.validate(data)
    if errores:
        return (make_response(ResponseStatus.FAIL, "Datos inválidos", errores), 400,)
    return SeccionService.update(id, data)

# Eliminar una sección (y sus bloques relacionados)
@seccion_bp.route('/<int:id>', methods=['DELETE'])
@api_access(is_public=False, access_permissions=["creus.admin.eliminar_seccion"])
def delete(id):
    return SeccionService.delete(id)
