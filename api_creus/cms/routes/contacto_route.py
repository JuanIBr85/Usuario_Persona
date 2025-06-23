from flask import Blueprint, request
from cms.services.contacto_service import ContactoService
from cms.schemas.contacto_schema import ContactoSchema
from routes.auth import get_token_required
from utils.response_utils import make_response, ResponseStatus

contacto_bp = Blueprint('contacto', __name__)

token_required = get_token_required()

# Obtener los datos de contacto (solo hay uno)
@contacto_bp.route('/', methods=['GET'])
def obtener_contacto():
    return ContactoService.get_contacto()

# Actualizar los datos de contacto
@contacto_bp.route('/', methods=['PUT'])
# @token_required
# def actualizar_contacto(current_user):
def actualizar_contacto():
    data = request.get_json()

    schema = ContactoSchema()
    errores = schema.validate(data)
    if errores:
         return make_response(ResponseStatus.ERROR, "Datos inválidos", errores)

    return ContactoService.update_contacto(data)