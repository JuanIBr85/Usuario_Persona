from flask import Blueprint, request
from cms.services.categoria_service import CategoriaService
from cms.schemas.categoria_schema import CategoriaSchema
from routes.auth import get_token_required
from utils.response_utils import make_response, ResponseStatus
from utils.validation_utils import validar_schema

categoria_bp = Blueprint("categoria", __name__)
token_required = get_token_required()


@categoria_bp.route("/", methods=["GET"])
def listar():
    return CategoriaService.get_all()


@categoria_bp.route("/", methods=["POST"])
# @token_required
def crear():
    data = request.get_json()
    schema, errores = validar_schema(CategoriaSchema, data)
    if errores:
        return make_response(ResponseStatus.ERROR, "Datos inválidos", errores)
    return CategoriaService.create(data)


@categoria_bp.route("/<int:id>", methods=["PUT"])
# @token_required
def actualizar(id):
    data = request.get_json()
    schema, errores = validar_schema(CategoriaSchema, data, context={"id": id})
    if errores:
        return make_response(ResponseStatus.ERROR, "Datos inválidos", errores)
    return CategoriaService.update(id, data)


@categoria_bp.route("/<int:id>", methods=["DELETE"])
# @token_required
def eliminar(id):
    return CategoriaService.delete(id)
