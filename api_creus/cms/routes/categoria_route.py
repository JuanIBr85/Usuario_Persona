from flask import Blueprint, request
from cms.services.categoria_service import CategoriaService
from cms.schemas.categoria_schema import CategoriaSchema
from utils.response_utils import make_response, ResponseStatus
from common.decorators.api_access import CacheSettings, api_access

categoria_bp = Blueprint('categoria', __name__)

# Obtener todas las categorías

@categoria_bp.route('/', methods=['GET'])
@api_access(is_public=True)
def get_all():
    return CategoriaService.get_all()

# Crear una nueva categoría

@categoria_bp.route('/', methods=['POST'])
@api_access(is_public=False, access_permissions=["creus.admin.crear_categoria"])
def create():
    schema = CategoriaSchema()
    data = request.get_json()
    errores = schema.validate(data)
    if errores:
        return (make_response(ResponseStatus.FAIL, "Datos inválidos", errores), 400,)
    return CategoriaService.create(data)

# Actualizar una categoría

@categoria_bp.route('/<int:id>', methods=['PUT'])
@api_access(is_public=False, access_permissions=["creus.admin.editar_categoria"])
def update(id):
    schema_with_context = CategoriaSchema()
    schema_with_context.context = {'id': id}
    data = request.get_json()
    errores = schema_with_context.validate(data)
    if errores:
        return (make_response(ResponseStatus.FAIL, "Datos inválidos", errores), 400,)
    return CategoriaService.update(id, data)

# Eliminar una categoría (y sus preguntas asociadas)

@categoria_bp.route('/<int:id>', methods=['DELETE'])
@api_access(is_public=False, access_permissions=["creus.admin.borrar_categoria"])
def delete(id):
    return CategoriaService.delete(id)
