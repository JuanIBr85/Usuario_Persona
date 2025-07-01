from flask import Blueprint, request
from services.modalidad_service import ModalidadService
from common.decorators.api_access import CacheSettings, api_access

modalidad_bp = Blueprint('modalidad', __name__)

# Obtener todas las modalidades
@modalidad_bp.route('/', methods=['GET'])
@api_access(is_public=True)
def get_all_modalidades():
    return ModalidadService.get_all()

# Obtener modalidad por ID
@modalidad_bp.route('/<int:id>', methods=['GET'])
@api_access(is_public=False, access_permissions=["creus.admin.ver_modalidad_id"])
def get_modalidad_by_id(id):
    return ModalidadService.get_by_id(id)
