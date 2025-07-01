from flask import Blueprint, request
from services.estado_service import EstadoService
from common.decorators.api_access import CacheSettings, api_access

estado_bp = Blueprint('estado', __name__)

# Obtener todos los estados
@estado_bp.route('/', methods=['GET'])
@api_access(is_public=False, access_permissions=["creus.admin.ver_estado"])
def get_all_estados():
    return EstadoService.get_all()

# Obtener estado por ID
@estado_bp.route('/<int:id>', methods=['GET'])
@api_access(is_public=False, access_permissions=["creus.admin.ver_estado_id"])
def get_by_id(id):
    return EstadoService.get_by_id(id)

