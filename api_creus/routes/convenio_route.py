from flask import Blueprint, request
from services.convenio_service import ConvenioService
from schemas.convenio_schema import ConvenioSchema
from utils.response_utils import make_response, ResponseStatus
from common.decorators.api_access import CacheSettings, api_access

convenio_bp = Blueprint('convenio', __name__)

# Obtener todos los convenios
@convenio_bp.route('/', methods=['GET'])
@api_access(is_public=False, access_permissions=["creus.admin.ver_convenio"])
def get_all_convenios():
    return ConvenioService.get_all()

# Obtener convenio por ID
@convenio_bp.route('/<int:id>', methods=['GET'])
@api_access(is_public=False, access_permissions=["creus.admin.ver_convenio_id"])
def get_by_id(id):
    return ConvenioService.get_by_id(id)

# Obtener convenios activos
@convenio_bp.route('/activos', methods=['GET'])
@api_access(is_public=True)
def get_activos():
    return ConvenioService.get_activos()

# Crear convenio
@convenio_bp.route('/', methods=['POST'])
@api_access(is_public=False, access_permissions=["creus.admin.crear_convenio"])
def create_convenio():
    data = request.get_json()

    # Validación con schema
    schema = ConvenioSchema()
    errores = schema.validate(data)
    if errores:
        return (make_response(ResponseStatus.FAIL, "Datos inválidos", errores), 400,)
    
    return ConvenioService.create(data)

# Editar convenio
@convenio_bp.route('/<int:id>', methods=['PUT'])
@api_access(is_public=False, access_permissions=["creus.admin.editar_convenio"])
def update_convenio(id):
    data = request.get_json()

    schema = ConvenioSchema()
    errores = schema.validate(data)
    if errores:
        return (make_response(ResponseStatus.FAIL, "Datos inválidos", errores), 400,)
    
    return ConvenioService.update(id, data)

# Borrado lógico convenio
@convenio_bp.route('/<int:id>', methods=['DELETE'])
@api_access(is_public=False, access_permissions=["creus.admin.eliminar_convenio"])
def delete_convenio(id):
    return ConvenioService.delete(id)