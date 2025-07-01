from flask import Blueprint, request
from cms.services.preguntas_frecuentes_service import PreguntaFrecuenteService
from cms.schemas.preguntas_frecuentes_schema import PreguntaFrecuenteSchema
from utils.response_utils import make_response, ResponseStatus
from common.decorators.api_access import CacheSettings, api_access

faq_bp = Blueprint('faq', __name__)

# Obtener todas las preguntas frecuentes
@faq_bp.route('/', methods=['GET'])
@api_access(is_public=True)
def get_all():
    return PreguntaFrecuenteService.get_all()

# Obtener todas las preguntas frecuentes por categoria
@faq_bp.route('/categoria/<int:id_categoria>', methods=['GET'])
@api_access(is_public=False, access_permissions=["creus.admin.ver_pregunta_frecuente_categoria_id"])
def get_by_categoria(id_categoria):
    return PreguntaFrecuenteService.get_by_categoria(id_categoria)

#Crear pregunta frecuente
@faq_bp.route('/', methods=['POST'])
@api_access(is_public=False, access_permissions=["creus.admin.crear_pregunta_frecuente"])
def create():
    schema = PreguntaFrecuenteSchema()
    data = request.get_json()
    errores = schema.validate(data)
    if errores:
        return (make_response(ResponseStatus.FAIL, "Datos inválidos", errores), 400,)
    return PreguntaFrecuenteService.create(data)

#Actualizar pregunta frecuente
@faq_bp.route('/<int:id>', methods=['PUT'])
@api_access(is_public=False, access_permissions=["creus.admin.editar_pregunta_frecuente"])
def update(id):
    schema_with_context = PreguntaFrecuenteSchema()
    schema_with_context.context = {'id': id}
    data = request.get_json()
    errores = schema_with_context.validate(data)
    if errores:
        return (make_response(ResponseStatus.FAIL, "Datos inválidos", errores), 400,)
    return PreguntaFrecuenteService.update(id, data)

#Eliminar pregunta frecuente
@faq_bp.route('/<int:id>', methods=['DELETE'])
@api_access(is_public=False, access_permissions=["creus.admin.eliminar_pregunta_frecuente"])
def delete(id):
    return PreguntaFrecuenteService.delete(id)
