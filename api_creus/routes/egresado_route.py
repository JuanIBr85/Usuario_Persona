from flask import Blueprint, request
from services.egresado_service import EgresadoService
from schemas.egresado_schema import EgresadoSchema
from utils.response_utils import make_response, ResponseStatus
from common.decorators.api_access import CacheSettings, api_access

egresado_bp = Blueprint('egresado', __name__)

# Obtener todos los egresados
@egresado_bp.route('/', methods = ['GET'])
@api_access(is_public=True)
def get_all_egresados():
    return EgresadoService.get_all()

# Obtener egresado por ID
@egresado_bp.route('/<int:id>', methods = ['GET'])
@api_access(is_public=False, access_permissions=["creus.admin.ver_egresado_id"])
def get_by_id(id):
    return EgresadoService.get_by_id(id)

# Obtener egresados por el ID  de la cohorte
@egresado_bp.route('/cohorte/<int:id_cohorte>', methods = ['GET'])
@api_access(is_public=False, access_permissions=["creus.admin.ver_egresado_cohorte_id"])
def get_by_cohorte(id_cohorte):
    return EgresadoService.get_by_cohorte(id_cohorte)

# Crear egresado
@egresado_bp.route('/', methods = ['POST'])
@api_access(is_public=False, access_permissions=["creus.admin.crear_egresado"])
def create_egresado():
    data = request.get_json()

    # Validación con schema
    schema = EgresadoSchema()
    errores = schema.validate(data)
    if errores:
        return (make_response(ResponseStatus.FAIL, "Datos inválidos", errores), 400,)
    
    return EgresadoService.create(data)

# Editar egresado
@egresado_bp.route('/<int:id>', methods = ['PUT'])
@api_access(is_public=False, access_permissions=["creus.admin.editar_egresado"])
def update(id):
    data = request.get_json()

    schema = EgresadoSchema()
    errores = schema.validate(data)
    if errores:
        return (make_response(ResponseStatus.FAIL, "Datos inválidos", errores), 400,)
    
    return EgresadoService.update(id, data)

# Borrado lógico egresado
@egresado_bp.route('/<int:id>', methods = ['DELETE'])
@api_access(is_public=False, access_permissions=["creus.admin.eliminar_egresado"])
def delete(id):
    return EgresadoService.delete(id)