from flask import Blueprint, request
from services.titulo_certificacion_service import TituloCertificacionService
from schemas.titulo_certificacion_schema import TituloCertificacionSchema
from utils.response_utils import error_response

titulo_bp = Blueprint('titulo_certificacion', __name__)
schema = TituloCertificacionSchema()

@titulo_bp.route('/', methods=['GET'])
def listar():
    return TituloCertificacionService.get_all()

@titulo_bp.route('/<int:id>', methods=['GET'])
def obtener(id):
    return TituloCertificacionService.get_by_id(id)

@titulo_bp.route('/', methods=['POST'])
def crear():
    data = request.get_json()
    errores = schema.validate(data)
    if errores:
        return error_response("Datos inválidos", errores)
    return TituloCertificacionService.create(data)

@titulo_bp.route('/<int:id>', methods=['PUT'])
def actualizar(id):
    data = request.get_json()
    errores = schema.validate(data)
    if errores:
        return error_response("Datos inválidos", errores)
    return TituloCertificacionService.update(id, data)

@titulo_bp.route('/<int:id>', methods=['DELETE'])
def eliminar(id):
    return TituloCertificacionService.delete(id)