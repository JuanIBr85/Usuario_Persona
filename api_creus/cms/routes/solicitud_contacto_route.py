from flask import Blueprint, request
from cms.models.solicitud_contacto_model import SolicitudContacto
from models import db
from routes.auth import get_token_required
from cms.services.solicitud_contacto_service import SolicitudContactoService
from cms.schemas.solicitud_contacto_schema import SolicitudContactoSchema
from utils.response_utils import make_response, ResponseStatus
from common.decorators.api_access import CacheSettings, api_access

solicitud_contacto_bp = Blueprint('cms_solicitud_contacto', __name__)
token_required = get_token_required()

# obtener todas las solicitudes de contacto
@solicitud_contacto_bp.route('/', methods=['GET'])
@api_access(is_public=False, access_permissions=["creus.admin.ver_solicitudes"])
def get_all_solicitudes():
    return SolicitudContactoService.get_all()

# obtener solicitud por ID (para la vista)
@solicitud_contacto_bp.route('/<int:id>', methods=['GET'])
@api_access(is_public=False, access_permissions=["creus.admin.ver_solicitudes"])
def get_solicitud_by_id(id):
    return SolicitudContactoService.get_by_id(id)

# crear nueva solicitud de contacto (página pública)
@solicitud_contacto_bp.route('/', methods=['POST'])
@api_access(is_public=True)
def create_solicitud():
    print("[DEBUG] Recibida solicitud POST en /cms/solicitudes-contacto/")
    data = request.get_json()
    print(f"[DEBUG] Datos recibidos: {data}")
    
    # validación con schema
    schema = SolicitudContactoSchema()
    print("[DEBUG] Iniciando validación con schema")
    errores = schema.validate(data)
    if errores:
        print(f"[DEBUG] Errores de validación: {errores}")
        return make_response(ResponseStatus.FAIL, "Datos inválidos", errores)
    
    print("[DEBUG] Validación exitosa, llamando al servicio")
    result = SolicitudContactoService.create(data)
    print(f"[DEBUG] Resultado del servicio: {result}")
    return result

# actualizar solicitud (marcar como respondida)
@solicitud_contacto_bp.route('/<int:id>', methods=['PUT'])
@api_access(is_public=False, access_permissions=["creus.admin.actualizar_solicitud"])
def update_solicitud(id):
    data = request.get_json()
    
    # solo permitir actualizar el campo 'respondida' porque solo hay ese valor
    allowed_fields = {'respondida'}
    filtered_data = {k: v for k, v in data.items() if k in allowed_fields}
    
    if not filtered_data:
        return make_response(ResponseStatus.FAIL, "No se proporcionaron campos válidos para actualizar")
    
    return SolicitudContactoService.update(id, filtered_data)

# eliminación lógica de solicitud
@solicitud_contacto_bp.route('/<int:id>/soft-delete', methods=['PUT'])
@api_access(is_public=False, access_permissions=["creus.admin.eliminar_solicitud"])
def soft_delete_solicitud(id):
    return SolicitudContactoService.soft_delete(id)

# eliminar solicitud físicamente
@solicitud_contacto_bp.route('/<int:id>', methods=['DELETE'])
@api_access(is_public=False, access_permissions=["creus.admin.eliminar_solicitud"])
def delete_solicitud(id):
    return SolicitudContactoService.delete(id)

# obtener solicitudes pendientes
@solicitud_contacto_bp.route('/pendientes', methods=['GET'])
@api_access(is_public=False, access_permissions=["creus.admin.ver_solicitudes"])
def get_solicitudes_pendientes():
    return SolicitudContactoService.get_pending()

# obtener solicitudes respondidas
@solicitud_contacto_bp.route('/respondidas', methods=['GET'])
@api_access(is_public=False, access_permissions=["creus.admin.ver_solicitudes"])
def get_solicitudes_respondidas():
    return SolicitudContactoService.get_answered()