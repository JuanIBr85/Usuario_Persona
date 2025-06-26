from flask import Blueprint, request
from services.archivo_service import ArchivoService
from schemas.archivo_schema import ArchivoSchema
from utils.response_utils import make_response, ResponseStatus
from common.decorators.api_access import CacheSettings, api_access


archivo_bp = Blueprint('archivo', __name__)

@archivo_bp.route('/', methods=['GET'])
@api_access(is_public=False, access_permissions=["creus.admin.ver_archivos"])
def listar():
    # Listar todos los archivos
    return ArchivoService.get_all()

@archivo_bp.route('/<int:id>', methods=['GET'])
@api_access(is_public=True)
def obtener(id):
    # Obtiene un archivo por su id
    return ArchivoService.get_by_id(id)

@archivo_bp.route('/propuesta-educativa/<int:id_propuesta_educativa>', methods=['GET'])
@api_access(is_public=True)
def listar_por_propuesta_educativa(id_propuesta_educativa):
    # Lista todos los archivos de una propuesta educativa (en especifico)
    return ArchivoService.get_by_propuesta_educativa(id_propuesta_educativa)

@archivo_bp.route('/', methods=['POST'])
@api_access(is_public=False, access_permissions=["creus.admin.crear_archivo"])
def crear(): 
    # Crea un nuevo archivo
    data = request.get_json()
    schema = ArchivoSchema()
    errores = schema.validate(data)

    if errores:
        return make_response(ResponseStatus.FAIL, "Datos inválidos", errores)
    return ArchivoService.create(data)

@archivo_bp.route('/<int:id>', methods=['PUT'])
@api_access(is_public=False, access_permissions=["creus.admin.editar_archivo"])
def actualizar(id):
    # Actualiza un archivo
    data = request.get_json()
    schema = ArchivoSchema(partial=True)  # Permite actualizaciones parciales
    errores = schema.validate(data)
    if errores:
        return make_response(ResponseStatus.FAIL, "Datos inválidos", errores)
    return ArchivoService.update(id, data)

@archivo_bp.route('/<int:id>', methods=['DELETE'])
@api_access(is_public=False, access_permissions=["creus.admin.borrar_archivo"])
def eliminar(id): 
    # Elimina un archivo
    return ArchivoService.delete(id)