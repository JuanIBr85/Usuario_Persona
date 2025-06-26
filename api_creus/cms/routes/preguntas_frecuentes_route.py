from flask import Blueprint, request
from cms.services.preguntas_frecuentes_service import PreguntaFrecuenteService
from cms.schemas.preguntas_frecuentes_schema import PreguntaFrecuenteSchema
from routes.auth import get_token_required
from utils.response_utils import make_response, ResponseStatus
from utils.validation_utils import validar_schema

preguntas_bp = Blueprint("preguntas_frecuentes", __name__)
token_required = get_token_required()


@preguntas_bp.route("/", methods=["GET"])
def listar():
    return PreguntaFrecuenteService.get_all()


@preguntas_bp.route("/categoria/<int:id_categoria>", methods=["GET"])
def por_categoria(id_categoria):
    return PreguntaFrecuenteService.get_by_categoria(id_categoria)


@preguntas_bp.route("/", methods=["POST"])
# @token_required
def crear():
    data = request.get_json()
    schema, errores = validar_schema(PreguntaFrecuenteSchema, data)
    if errores:
        return make_response(ResponseStatus.ERROR, "Datos inválidos", errores)
    return PreguntaFrecuenteService.create(data)


@preguntas_bp.route("/<int:id>", methods=["PUT"])
# @token_required
def actualizar(id):
    data = request.get_json()
    schema, errores = validar_schema(
        PreguntaFrecuenteSchema, data, context={"id_instancia": id})
    if errores:
        return make_response(ResponseStatus.ERROR, "Datos inválidos", errores)
    return PreguntaFrecuenteService.update(id, data)


@preguntas_bp.route("/<int:id>", methods=["DELETE"])
# @token_required
def eliminar(id):
    return PreguntaFrecuenteService.delete(id)
