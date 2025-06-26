from flask import Blueprint, request
from services.cohorte_service import CohorteService
from schemas.cohorte_schema import CohorteSchema
from utils.response_utils import make_response, ResponseStatus
# from routes.auth import get_token_required  

cohorte_bp = Blueprint('cohorte', __name__)
schema = CohorteSchema()
# token_required = get_token_required()

# Obtener todas las cohortes (sin importar su estado)
@cohorte_bp.route('/', methods=['GET'])
def listar_todas():
    return CohorteService.get_all()

# Obtener solo cohortes activas 
@cohorte_bp.route('/activas', methods=['GET'])
def listar_activas():
    return CohorteService.get_by_estado(1)

# Obtener solo cohortes inactivas
@cohorte_bp.route('/inactivas', methods=['GET'])
def listar_inactivas():
    return CohorteService.get_by_estado(2)

# Obtener una cohorte por su ID
@cohorte_bp.route('/<int:id>', methods=['GET'])
def obtener(id):
    return CohorteService.get_by_id(id)

# Crear una nueva cohorte
@cohorte_bp.route('/', methods=['POST'])
# @token_required
def crear():  # def crear(current_user):
    data = request.get_json()
    errores = schema.validate(data)
    if errores:
        return make_response(ResponseStatus.FAIL, "Datos inválidos", errores)
    return CohorteService.create(data)

# Actualizar una cohorte existente
@cohorte_bp.route('/<int:id>', methods=['PUT'])
# @token_required
def actualizar(id):  # def actualizar(id, current_user):
    data = request.get_json()
    errores = schema.validate(data)
    if errores:
        return make_response(ResponseStatus.FAIL, "Datos inválidos", errores)
    return CohorteService.update(id, data)

# Eliminado lógico
@cohorte_bp.route('/<int:id>', methods=['DELETE'])
# @token_required
def eliminar(id):  # def eliminar(id, current_user):
    return CohorteService.delete(id)
