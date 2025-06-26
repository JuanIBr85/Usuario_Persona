from flask import Blueprint, request
from services.convenio_service import ConvenioService
from schemas.convenio_schema import ConvenioSchema
from utils.response_utils import make_response, ResponseStatus

convenio_bp = Blueprint('convenio', __name__)
schema = ConvenioSchema()

@convenio_bp.route('/', methods=['GET'])
def listar():
    return ConvenioService.get_all()

@convenio_bp.route('/<int:id>', methods=['GET'])
def obtener(id):
    return ConvenioService.get_by_id(id)

@convenio_bp.route('/', methods=['POST'])
def crear():
    data = request.get_json()
    errores = schema.validate(data)
    if errores:
        return make_response(ResponseStatus.FAIL, "Datos inválidos", errores)
    return ConvenioService.create(data)

@convenio_bp.route('/<int:id>', methods=['PUT'])
def actualizar(id):
    data = request.get_json()
    errores = schema.validate(data)
    if errores:
        return make_response(ResponseStatus.FAIL, "Datos inválidos", errores)
    return ConvenioService.update(id, data)

@convenio_bp.route('/<int:id>', methods=['DELETE'])
def eliminar(id):
    return ConvenioService.delete(id)