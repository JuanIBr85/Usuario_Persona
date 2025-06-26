from flask import Blueprint, request
from cms.services.pagina_inicio_service import PaginaInicioService
from cms.schemas.pagina_inicio_schema import PaginaInicioSchema
from routes.auth import get_token_required
from utils.response_utils import make_response, ResponseStatus

pagina_inicio_bp = Blueprint('pagina_inicio', __name__)
token_required = get_token_required()

# Obtener datos de página de inicio (solo hay uno)
@pagina_inicio_bp.route('/', methods=['GET'])
def obtener_pagina_inicio():
    return PaginaInicioService.get_datos()

# Actualizar datos de página de inicio
@pagina_inicio_bp.route('/', methods=['PUT'])
# @token_required
# def actualizar_pagina_inicio(current_user):
def actualizar_pagina_inicio():
    data = request.get_json()

    schema = PaginaInicioSchema()
    errores = schema.validate(data)
    if errores:
        return make_response(ResponseStatus.FAIL, "Datos inválidos", errores)

    return PaginaInicioService.update_datos(data)