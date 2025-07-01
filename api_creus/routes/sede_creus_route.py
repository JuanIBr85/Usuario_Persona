from flask import Blueprint, request
from services.sede_creus_service import SedeCreusService
from schemas.sede_creus_schema import SedeCreusSchema
from utils.response_utils import make_response, ResponseStatus
from common.decorators.api_access import CacheSettings, api_access

sede_creus_bp = Blueprint('sede_creus', __name__)
schema = SedeCreusSchema()

# Obtener todas las sedes
@sede_creus_bp.route('/', methods=['GET'])
@api_access(is_public=False, access_permissions=["creus.admin.ver_sede_creus"])
def get_all_sedes():
    return SedeCreusService.get_all()

# Obtener todas las sedes activas
@sede_creus_bp.route('/activas', methods=['GET'])
@api_access(is_public=True)
def get_sedes_activas():
    return SedeCreusService.get_all_by_estado(1)

# Obtener todas las sedes inactivas
@sede_creus_bp.route('/inactivas', methods=['GET'])
@api_access(is_public=False, access_permissions=["creus.admin.ver_sede_creus_inactiva"])
def get_sedes_inactivas():
    return SedeCreusService.get_all_by_estado(2)

# Obtener sede por ID
@sede_creus_bp.route('/<int:id>', methods=['GET'])
@api_access(is_public=False, access_permissions=["creus.admin.ver_sede_creus_id"])
def get_sede_by_id(id):
    return SedeCreusService.get_by_id(id)

# Crear nueva sede
@sede_creus_bp.route('/', methods=['POST'])
@api_access(is_public=False, access_permissions=["creus.admin.crear_sede_creus"])
def create():
    data = request.get_json()
    if not data:
        return (make_response(ResponseStatus.FAIL, "Faltan datos en la solicitud", {"body": "Requerido"}), 400,)
    errores = schema.validate(data)
    if errores:
        return (make_response(ResponseStatus.FAIL, "Datos inválidos", errores), 400,)
    return SedeCreusService.create(data)

# Editar sede
@sede_creus_bp.route('/<int:id>', methods=['PUT'])
@api_access(is_public=False, access_permissions=["creus.admin.editar_sede_creus"])
def update(id):
    data = request.get_json()
    if not data:
        return (make_response(ResponseStatus.FAIL, "Faltan datos en la solicitud", {"body": "Requerido"}), 400,)
    errores = schema.validate(data)
    if errores:
        return (make_response(ResponseStatus.FAIL, "Datos inválidos", errores), 400,)
    return SedeCreusService.update(id, data)

# Borrado lógico sede
@sede_creus_bp.route('/<int:id>', methods=['DELETE'])
@api_access(is_public=False, access_permissions=["creus.admin.eliminar_sede_creus"])
def delete(id):
    return SedeCreusService.delete(id)
