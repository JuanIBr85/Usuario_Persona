from flask import Blueprint, request
from services.archivo_service import ArchivoService
from schemas.archivo_schema import ArchivoSchema
from utils.response_utils import make_response, ResponseStatus
from common.decorators.api_access import CacheSettings, api_access

archivo_bp = Blueprint('archivo', __name__)

# Obtener todos los archivos
@archivo_bp.route('/', methods=['GET'])
@api_access(is_public=True)
def listar():
    return ArchivoService.get_all()

# Obtener un archivo por ID
@archivo_bp.route('/<int:id>', methods=['GET'])
@api_access(is_public=False, access_permissions=["creus.admin.ver_archivo_id"])
def obtener(id):
    return ArchivoService.get_by_id(id)

# Obtener todos los archivos de una propuesta educativa (en específico)
@archivo_bp.route('/propuesta-educativa/<int:id_propuesta_educativa>', methods=['GET'])
@api_access(is_public=False, access_permissions=["creus.admin.ver_archivo_propuesta_educativa_id"])
def listar_por_propuesta_educativa(id_propuesta_educativa):
    return ArchivoService.get_by_propuesta_educativa(id_propuesta_educativa)

# Crear un nuevo archivo
@archivo_bp.route('/', methods=['POST'])
@api_access(is_public=False, access_permissions=["creus.admin.crear_archivo"])
def crear(): 
    data = request.get_json()
    schema = ArchivoSchema()
    errores = schema.validate(data)
    if errores:
        return (make_response(ResponseStatus.FAIL, "Datos inválidos", errores), 400,)
    return ArchivoService.create(data)

# Editar un archivo
@archivo_bp.route('/<int:id>', methods=['PUT'])
@api_access(is_public=False, access_permissions=["creus.admin.editar_archivo"])
def actualizar(id):
    data = request.get_json()
    schema = ArchivoSchema(partial=True)  # Permite actualizaciones parciales
    errores = schema.validate(data)
    if errores:
        return (make_response(ResponseStatus.FAIL, "Datos inválidos", errores), 400,)
    return ArchivoService.update(id, data)

# Eliminar un archivo
@archivo_bp.route('/<int:id>', methods=['DELETE'])
@api_access(is_public=False, access_permissions=["creus.admin.eliminar_archivo"])
def eliminar(id): 
    return ArchivoService.delete(id)