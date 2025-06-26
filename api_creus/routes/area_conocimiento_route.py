from flask import Blueprint, request
from services.area_conocimiento_service import AreaConocimientoService
from schemas.area_conocimiento_schema import AreaConocimientoSchema
from utils.response_utils import make_response, ResponseStatus
# from routes.auth import get_token_required

area_bp = Blueprint('area_conocimiento', __name__)
# token_required = get_token_required()

@area_bp.route('/', methods=['GET'])
def listar():
    return AreaConocimientoService.get_all()

@area_bp.route('/<int:id>', methods=['GET'])
def obtener(id):
    return AreaConocimientoService.get_by_id(id)

@area_bp.route('/', methods=['POST'])
# @token_required
def crear():  # def crear(current_user):
    data = request.get_json()
    schema = AreaConocimientoSchema()
    errores = schema.validate(data)
    if errores:
        return make_response(ResponseStatus.FAIL, "Datos inválidos", errores)
    return AreaConocimientoService.create(data)

@area_bp.route('/<int:id>', methods=['PUT'])
# @token_required
def actualizar(id):  # def actualizar(id, current_user):
    data = request.get_json()
    schema = AreaConocimientoSchema()
    errores = schema.validate(data)
    if errores:
        return make_response(ResponseStatus.FAIL, "Datos inválidos", errores)
    return AreaConocimientoService.update(id, data)

@area_bp.route('/<int:id>', methods=['DELETE'])
# @token_required
def eliminar(id):  # def eliminar(id, current_user):
    return AreaConocimientoService.delete(id)




