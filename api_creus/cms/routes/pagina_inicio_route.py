from flask import Blueprint, request
from cms.services.pagina_inicio_service import PaginaInicioService
from cms.schemas.pagina_inicio_schema import PaginaInicioSchema
from utils.response_utils import make_response, ResponseStatus
from common.decorators.api_access import CacheSettings, api_access

pagina_inicio_bp = Blueprint('pagina_inicio', __name__)

# Obtener datos de página de inicio (solo hay uno)
@pagina_inicio_bp.route('/', methods=['GET'])
@api_access(is_public=True)
def obtener_pagina_inicio():
    return PaginaInicioService.get_datos()

# Actualizar datos de página de inicio
@pagina_inicio_bp.route('/', methods=['PUT'])
@api_access(is_public=False, access_permissions=["creus.admin.actualizar_pagina_inicio"])
def actualizar_pagina_inicio():
    data = request.get_json()

    schema = PaginaInicioSchema()
    errores = schema.validate(data)
    if errores:
        return (make_response(ResponseStatus.FAIL, "Datos inválidos", errores), 400,)

    return PaginaInicioService.update_datos(data)