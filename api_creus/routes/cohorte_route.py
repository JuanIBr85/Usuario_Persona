from flask import Blueprint, request
from services.cohorte_service import CohorteService
from schemas.cohorte_schema import CohorteSchema
from utils.response_utils import make_response, ResponseStatus
from common.decorators.api_access import CacheSettings, api_access

cohorte_bp = Blueprint('cohorte', __name__)
schema = CohorteSchema()

# Obtener todas las cohortes (sin importar su estado)
@cohorte_bp.route('/', methods=['GET'])
@api_access(is_public=False, access_permissions=["creus.admin.ver_cohorte"])
def listar_todas():
    return CohorteService.get_all()

# Obtener solo cohortes activas 
@cohorte_bp.route('/activas', methods=['GET'])
@api_access(is_public=True)
def listar_activas():
    return CohorteService.get_by_estado(1)

# Obtener solo cohortes inactivas
@cohorte_bp.route('/inactivas', methods=['GET'])
@api_access(is_public=False, access_permissions=["creus.admin.ver_cohorte_inactiva"])
def listar_inactivas():
    return CohorteService.get_by_estado(2)

# Obtener una cohorte por su ID
@cohorte_bp.route('/<int:id>', methods=['GET'])
@api_access(is_public=False, access_permissions=["creus.admin.ver_cohorte_id"])
def obtener(id):
    return CohorteService.get_by_id(id)

# Crear una nueva cohorte
@cohorte_bp.route('/', methods=['POST'])
@api_access(is_public=False, access_permissions=["creus.admin.crear_cohorte"])
def crear():  
    data = request.get_json()
    errores = schema.validate(data)
    if errores:
        return (make_response(ResponseStatus.FAIL, "Datos inválidos", errores), 400,)
    return CohorteService.create(data)

# Actualizar una cohorte
@cohorte_bp.route('/<int:id>', methods=['PUT'])
@api_access(is_public=False, access_permissions=["creus.admin.editar_cohorte"])
def actualizar(id):  
    data = request.get_json()
    errores = schema.validate(data)
    if errores:
        return (make_response(ResponseStatus.FAIL, "Datos inválidos", errores), 400,)
    return CohorteService.update(id, data)

# Eliminado lógico cohorte
@cohorte_bp.route('/<int:id>', methods=['DELETE'])
@api_access(is_public=False, access_permissions=["creus.admin.eliminar_cohorte"])
def eliminar(id):  
    return CohorteService.delete(id)
