from flask import Blueprint, request
from services.tipo_propuesta_service import TipoPropuestaService
from schemas.tipo_propuesta_schema import TipoPropuestaSchema
from utils.response_utils import error_response
from common.decorators.api_access import api_access

tipo_bp = Blueprint("tipo_propuesta", __name__)
schema = TipoPropuestaSchema()


@tipo_bp.route("/", methods=["GET"])
@api_access(is_public=True)
def listar():
    return TipoPropuestaService.get_all()


@tipo_bp.route("/<int:id>", methods=["GET"])
@api_access(is_public=True)
def obtener(id):
    return TipoPropuestaService.get_by_id(id)


@tipo_bp.route("/", methods=["POST"])
@api_access(is_public=True)
def crear():
    data = request.get_json()
    errores = schema.validate(data)
    if errores:
        return error_response("Datos inválidos", errores)
    return TipoPropuestaService.create(data)


@tipo_bp.route("/<int:id>", methods=["PUT"])
@api_access(is_public=True)
def actualizar(id):
    data = request.get_json()
    errores = schema.validate(data)
    if errores:
        return error_response("Datos inválidos", errores)
    return TipoPropuestaService.update(id, data)


@tipo_bp.route("/<int:id>", methods=["DELETE"])
@api_access(is_public=True)
def eliminar(id):
    return TipoPropuestaService.delete(id)
