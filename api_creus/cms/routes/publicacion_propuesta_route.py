from flask import Blueprint, request
from cms.services.publicacion_propuesta_service import PublicacionPropuestaService
from cms.schemas.publicacion_propuesta_schema import PublicacionPropuestaSchema
from utils.response_utils import make_response, ResponseStatus
from common.decorators.api_access import CacheSettings, api_access

publicacion_bp = Blueprint('publicacion_propuesta', __name__)

schema = PublicacionPropuestaSchema()
schema_many = PublicacionPropuestaSchema(many=True)

# Obtener todas las publicaciones visibles
@publicacion_bp.route('/', methods=['GET'])
@api_access(is_public=True)
def obtener_publicaciones_visibles():
    return PublicacionPropuestaService.get_all_visibles()

# Obtener todas las publicaciones (admin)
@publicacion_bp.route('/todos', methods=['GET'])
@api_access(is_public=False, access_permissions=["creus.admin.ver_publicacion_propuesta"])
def obtener_todas_publicaciones():
    return PublicacionPropuestaService.get_all()

# Crear nueva publicación
@publicacion_bp.route('/', methods=['POST'])
@api_access(is_public=False, access_permissions=["creus.admin.crear_publicacion_propuesta"])
def crear_publicacion():
    data = request.get_json()
    errores = schema.validate(data)
    if errores:
        return (make_response(ResponseStatus.ERROR, "Datos inválidos", errores), 400,)
    
    return PublicacionPropuestaService.create(data)

# Actualizar publicación
@publicacion_bp.route('/<int:id>', methods=['PUT'])
@api_access(is_public=False, access_permissions=["creus.admin.editar_publicacion_propuesta"])
def actualizar_publicacion(id):
    data = request.get_json()
    errores = schema.validate(data)
    if errores:
        return (make_response(ResponseStatus.ERROR, "Datos inválidos", errores), 400,)

    return PublicacionPropuestaService.update(id, data)

# Eliminar (ocultar) una publicación
@publicacion_bp.route('/<int:id>', methods=['DELETE'])
@api_access(is_public=False, access_permissions=["creus.admin.eliminar_publicacion_propuesta"])
def eliminar_publicacion(id):
    return PublicacionPropuestaService.delete(id)