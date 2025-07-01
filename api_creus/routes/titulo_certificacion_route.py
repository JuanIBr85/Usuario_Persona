from flask import Blueprint, request
from services.titulo_certificacion_service import TituloCertificacionService
from schemas.titulo_certificacion_schema import TituloCertificacionSchema
from utils.response_utils import make_response, ResponseStatus
from common.decorators.api_access import CacheSettings, api_access 

titulo_bp = Blueprint('titulo_certificacion', __name__) 

# Obtener todos los títulos-certificaciones
@titulo_bp.route('/', methods=['GET'])
@api_access(is_public=True)
def listar():
    return TituloCertificacionService.get_all()

# Obtener título-certificación por ID
@titulo_bp.route('/<int:id>', methods=['GET'])
@api_access(is_public=False, access_permissions=["creus.admin.ver_titulo_certificacion_id"])
def obtener(id):
    return TituloCertificacionService.get_by_id(id)

# Crear título-certificación
@titulo_bp.route('/', methods=['POST'])
@api_access(is_public=False, access_permissions=["creus.admin.crear_titulo_certificacion"])
def crear():  
    data = request.get_json()
    schema = TituloCertificacionSchema()
    errores = schema.validate(data)
    if errores:
        return (make_response(ResponseStatus.FAIL, "Datos inválidos", errores), 400,)
    return TituloCertificacionService.create(data)

# Editar título-certificación
@titulo_bp.route('/<int:id>', methods=['PUT'])
@api_access(is_public=False, access_permissions=["creus.admin.editar_titulo_certificacion"])
def actualizar(id):  
    data = request.get_json()
    schema = TituloCertificacionSchema()
    errores = schema.validate(data)
    if errores:
        return (make_response(ResponseStatus.FAIL, "Datos inválidos", errores), 400,)
    return TituloCertificacionService.update(id, data)

# Eliminar título-certificación
@titulo_bp.route('/<int:id>', methods=['DELETE'])
@api_access(is_public=False, access_permissions=["creus.admin.eliminar_titulo_certificacion"])
def eliminar(id):  
    return TituloCertificacionService.delete(id)

