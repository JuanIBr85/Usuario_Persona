from flask import Blueprint, request
from services.institucion_service import InstitucionService
from schemas.institucion_schema import InstitucionSchema
from utils.response_utils import make_response, ResponseStatus
from common.decorators.api_access import CacheSettings, api_access

institucion_bp = Blueprint('institucion', __name__)

# Obtener todas las instituciones
@institucion_bp.route('/', methods=['GET'])
@api_access(is_public=False, access_permissions=["creus.admin.ver_institucion"])
def get_all_instituciones():
    return InstitucionService.get_all()

# Obtener institución por ID
@institucion_bp.route('/<int:id>', methods=['GET'])
@api_access(is_public=False, access_permissions=["creus.admin.ver_institucion_id"])
def get_by_id(id):
    return InstitucionService.get_by_id(id)

# Obtener instituciones activas
@institucion_bp.route('/activas', methods=['GET'])
@api_access(is_public=True)
def get_activas():
    return InstitucionService.get_activas()

# Crear institución
@institucion_bp.route('/', methods=['POST'])
@api_access(is_public=False, access_permissions=["creus.admin.crear_institucion"])
def create_institucion():
    data = request.get_json()

    # Validación con schema
    schema = InstitucionSchema()
    errores = schema.validate(data)
    if errores:
        return (make_response(ResponseStatus.FAIL, "Datos inválidos", errores), 400,)
    
    return InstitucionService.create(data)

# Editar institución
@institucion_bp.route('/<int:id>', methods=['PUT'])
@api_access(is_public=False, access_permissions=["creus.admin.editar_institucion"])
def update_institucion(id):
    data = request.get_json()

    schema = InstitucionSchema()
    errores = schema.validate(data)
    if errores:
        return (make_response(ResponseStatus.FAIL, "Datos inválidos", errores), 400,)
    
    return InstitucionService.update(id, data)

# Borrado lógico institución
@institucion_bp.route('/<int:id>', methods=['DELETE'])
@api_access(is_public=False, access_permissions=["creus.admin.eliminar_institucion"])
def delete_institucion(id):
    return InstitucionService.delete(id)