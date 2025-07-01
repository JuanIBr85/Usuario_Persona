from flask import Blueprint, request
from services.preinscripcion_service import PreinscripcionService
from models import db
from routes.auth import get_token_required
from sqlalchemy.orm import joinedload
from schemas.preinscripcion_schema import PreinscripcionSchema
from utils.response_utils import make_response, ResponseStatus
from common.decorators.api_access import CacheSettings, api_access

preinscripcion_bp = Blueprint('preinscripcion', __name__)
token_required = get_token_required()

#GET /api/preinscripcion obtener todas las preinscripciones
@preinscripcion_bp.route('/', methods = ['GET'])
@api_access(is_public = False, access_permissions = ["creus.admin.ver_preinscripciones"])
def get_all_preinscripciones():
    return PreinscripcionService.get_all()
    
#GET /api/preinscripcion/<id>  obtener preinscripcion por id
@preinscripcion_bp.route('/<int:id>', methods = ['GET'])
@api_access(is_public = False, access_permissions = ["creus.admin.ver_preinscripcion_id"])
def get_preinscripcion_by_id (id):
    return PreinscripcionService.get_by_id(id)

#GET /api/preinscripcion/<id_usuario> filtra por usuario
@preinscripcion_bp.route('/usuario/<int:id_usuario>', methods = ['GET'])
@api_access(is_public = False, access_permissions = ["creus.admin.ver_preinscripcion_usuario"])   
def get_by_usuario(id_usuario):
    return PreinscripcionService.get_by_usuario(id_usuario)

#GET /api/preinscripcion/<id_cohorte> filtra por cohorte
@preinscripcion_bp.route('/cohorte/<int:id_cohorte>', methods = ['GET'])
def get_by_cohorte(id_cohorte):
    return PreinscripcionService.get_by_cohorte(id_cohorte)


#POST /api/preinscripcion crear preinscripcion
@preinscripcion_bp.route('/', methods = ['POST'])
@api_access(is_public = True, access_permissions = ["creus.user.crear_preinscripcion"])
def create_preinscripcion():

    data = request.get_json()

    #Validación con schema
    schema = PreinscripcionSchema()
    errores = schema.validate(data)
    if errores:
        return make_response(ResponseStatus.FAIL, "Datos invalidos", errores)
    
    return PreinscripcionService.create(data)

#PUT /api/preinscripcion/<id>  actualizar
@preinscripcion_bp.route('/<int:id>', methods = ['PUT'])
@api_access(is_public = False, access_permissions = ["creus.admin.editar_preinscripcion"])
def update_preinscripcion(id):
    data = request.get_json()

    schema = PreinscripcionSchema()
    errores = schema.validate(data)
    if errores:
        return make_response(ResponseStatus.FAIL, "Datos inválidos", errores)
    
    return PreinscripcionService.update(id,data)

#DELETE /api/preinscripcion/<id> borrar preinscripcion
@preinscripcion_bp.route('/<int:id>', methods = ['DELETE'])
@api_access(is_public = False, access_permissions = ["creus.admin.borrar_preinscripcion"])
def delete_preinscripcion(id):
    return PreinscripcionService.delete(id)