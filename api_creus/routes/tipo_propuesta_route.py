from flask import Blueprint, request
from services.tipo_propuesta_service import TipoPropuestaService
from schemas.tipo_propuesta_schema import TipoPropuestaSchema
from utils.response_utils import make_response, ResponseStatus
# from routes.auth import get_token_required  

tipo_bp = Blueprint('tipo_propuesta', __name__)
# token_required = get_token_required() 

@tipo_bp.route('/', methods=['GET'])
def listar():
    return TipoPropuestaService.get_all()

@tipo_bp.route('/<int:id>', methods=['GET'])
def obtener(id):
    return TipoPropuestaService.get_by_id(id)

@tipo_bp.route('/', methods=['POST'])
# @token_required  
# def crear(current_user):  
def crear():
    data = request.get_json()
    schema = TipoPropuestaSchema()
    errores = schema.validate(data)
    if errores:
        return make_response(ResponseStatus.FAIL, "Datos inválidos", errores)
    return TipoPropuestaService.create(data)

@tipo_bp.route('/<int:id>', methods=['PUT'])
# @token_required
# def actualizar(id, current_user):
def actualizar(id):
    data = request.get_json()
    schema = TipoPropuestaSchema()
    errores = schema.validate(data)
    if errores:
        return make_response(ResponseStatus.FAIL, "Datos inválidos", errores)
    return TipoPropuestaService.update(id, data)

@tipo_bp.route('/<int:id>', methods=['DELETE'])
# @token_required
# def eliminar(id, current_user):
def eliminar(id):
    return TipoPropuestaService.delete(id)

