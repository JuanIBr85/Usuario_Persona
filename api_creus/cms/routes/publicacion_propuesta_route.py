from flask import Blueprint, request
from cms.services.publicacion_propuesta_service import PublicacionPropuestaService
from cms.schemas.publicacion_propuesta_schema import PublicacionPropuestaSchema
from routes.auth import get_token_required
from utils.response_utils import make_response, ResponseStatus

publicacion_bp = Blueprint('publicacion_propuesta', __name__)
token_required = get_token_required()

schema = PublicacionPropuestaSchema()
schema_many = PublicacionPropuestaSchema(many=True)

# Obtener todas las publicaciones visibles
@publicacion_bp.route('/', methods=['GET'])
def obtener_publicaciones_visibles():
    return PublicacionPropuestaService.get_all_visibles()

# Obtener todas las publicaciones (admin)
@publicacion_bp.route('/todos', methods=['GET'])
def obtener_todas_publicaciones():
    return PublicacionPropuestaService.get_all()

# Crear nueva publicación
@publicacion_bp.route('/', methods=['POST'])

def crear_publicacion():
    data = request.get_json()
    errores = schema.validate(data)
    if errores:
        return make_response(ResponseStatus.ERROR, "Datos inválidos", errores)
    
    return PublicacionPropuestaService.create(data)

# Actualizar publicación
@publicacion_bp.route('/<int:id>', methods=['PUT'])

def actualizar_publicacion(id):
    data = request.get_json()
    errores = schema.validate(data)
    if errores:
        return make_response(ResponseStatus.ERROR, "Datos inválidos", errores)

    return PublicacionPropuestaService.update(id, data)

# Eliminar (ocultar) una publicación
@publicacion_bp.route('/<int:id>', methods=['DELETE'])

def eliminar_publicacion(id):
    return PublicacionPropuestaService.delete(id)