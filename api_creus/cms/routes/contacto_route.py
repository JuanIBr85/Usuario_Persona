from flask import Blueprint, request
from cms.services.contacto_service import ContactoService
from cms.schemas.contacto_schema import ContactoSchema
from utils.response_utils import make_response, ResponseStatus
from common.decorators.api_access import CacheSettings, api_access

contacto_bp = Blueprint('contacto', __name__)

# Obtener los datos de contacto (solo hay uno)
@contacto_bp.route('/', methods=['GET'])
@api_access(is_public=True)
def obtener_contacto():
    return ContactoService.get_contacto()

# Actualizar los datos de contacto
@contacto_bp.route('/', methods=['PUT'])
@api_access(is_public=False, access_permissions=["creus.admin.editar_contacto"])
def actualizar_contacto():
    data = request.get_json()

    schema = ContactoSchema()
    errores = schema.validate(data)
    if errores:
         return (make_response(ResponseStatus.ERROR, "Datos inválidos", errores), 400,)

    return ContactoService.update_contacto(data)