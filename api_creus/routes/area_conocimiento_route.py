from flask import Blueprint, request
from services.area_conocimiento_service import AreaConocimientoService
from schemas.area_conocimiento_schema import AreaConocimientoSchema
from utils.response_utils import make_response, ResponseStatus

area_bp = Blueprint('area_conocimiento', __name__)
schema = AreaConocimientoSchema()

@area_bp.route('/', methods=['GET'])
def listar():
    return AreaConocimientoService.get_all()

@area_bp.route('/<int:id>', methods=['GET'])
def obtener(id):
    return AreaConocimientoService.get_by_id(id)

@area_bp.route('/', methods=['POST'])
def crear():
    data = request.get_json()
    errores = schema.validate(data)
    if errores:
        return make_response(ResponseStatus.FAIL, "Datos inválidos", errores)
    return AreaConocimientoService.create(data)

@area_bp.route('/<int:id>', methods=['PUT'])
def actualizar(id):
    data = request.get_json()
    errores = schema.validate(data)
    if errores:
        return make_response(ResponseStatus.FAIL, "Datos inválidos", errores)
    return AreaConocimientoService.update(id, data)

@area_bp.route('/<int:id>', methods=['DELETE'])
def eliminar(id):
    return AreaConocimientoService.delete(id)


'''from flask import Blueprint, request
from services.area_conocimiento_service import AreaConocimientoService
from schemas.area_conocimiento_schema import AreaConocimientoSchema
from utils.response_utils import error_response

area_bp = Blueprint('area_conocimiento', __name__)
schema = AreaConocimientoSchema()

@area_bp.route('/', methods=['GET'])
def listar():
    return AreaConocimientoService.get_all()

@area_bp.route('/<int:id>', methods=['GET'])
def obtener(id):
    return AreaConocimientoService.get_by_id(id)

@area_bp.route('/', methods=['POST'])
def crear():
    data = request.get_json()
    errores = schema.validate(data)
    if errores:
        return error_response("Datos inválidos", errores)
    return AreaConocimientoService.create(data)

@area_bp.route('/<int:id>', methods=['PUT'])
def actualizar(id):
    data = request.get_json()
    errores = schema.validate(data)
    if errores:
        return error_response("Datos inválidos", errores)
    return AreaConocimientoService.update(id, data)

@area_bp.route('/<int:id>', methods=['DELETE'])
def eliminar(id):
    return AreaConocimientoService.delete(id)'''
