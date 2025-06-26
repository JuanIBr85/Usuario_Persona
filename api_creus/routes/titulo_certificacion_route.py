from flask import Blueprint, request
from services.titulo_certificacion_service import TituloCertificacionService
from schemas.titulo_certificacion_schema import TituloCertificacionSchema
from utils.response_utils import make_response, ResponseStatus
# from routes.auth import get_token_required  

titulo_bp = Blueprint('titulo_certificacion', __name__)
# token_required = get_token_required()  

@titulo_bp.route('/', methods=['GET'])
def listar():
    return TituloCertificacionService.get_all()

@titulo_bp.route('/<int:id>', methods=['GET'])
def obtener(id):
    return TituloCertificacionService.get_by_id(id)

@titulo_bp.route('/', methods=['POST'])
# @token_required
def crear():  # def crear(current_user):
    data = request.get_json()
    schema = TituloCertificacionSchema()
    errores = schema.validate(data)
    if errores:
        return make_response(ResponseStatus.FAIL, "Datos inválidos", errores)
    return TituloCertificacionService.create(data)

@titulo_bp.route('/<int:id>', methods=['PUT'])
# @token_required
def actualizar(id):  # def actualizar(id, current_user):
    data = request.get_json()
    schema = TituloCertificacionSchema()
    errores = schema.validate(data)
    if errores:
        return make_response(ResponseStatus.FAIL, "Datos inválidos", errores)
    return TituloCertificacionService.update(id, data)

@titulo_bp.route('/<int:id>', methods=['DELETE'])
# @token_required
def eliminar(id):  # def eliminar(id, current_user):
    return TituloCertificacionService.delete(id)

