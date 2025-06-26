from flask import Blueprint, request, jsonify
from services.preinscripcion_service import PreinscripcionService
from models import db
from routes.auth import get_token_required
from sqlalchemy.orm import joinedload
from schemas.preinscripcion_schema import PreinscripcionSchema
from utils.response_utils import make_response, ResponseStatus

preinscripcion_bp = Blueprint('preinscripcion', __name__)
token_required = get_token_required()

#GET /api/preinscripcion obtener todas las preinscripciones
@preinscripcion_bp.route('/', methods = ['GET'])
def get_all_preinscripciones():
    return PreinscripcionService.get_all()
    
#GET /api/preinscripcion/<id> ---> obtener preinscripcion por id
@preinscripcion_bp.route('/<int:id>', methods = ['GET'])
def get_preinscripcion_by_id (id):
    return PreinscripcionService.get_by_id(id)

#GET /api/preinscripcion/<id_usuario> ---> filtra por usuario
@preinscripcion_bp.route('/usuario/<int:id_usuario>', methods = ['GET'])   
def get_by_usuario(id_usuario):
    return PreinscripcionService.get_by_usuario(id_usuario)

#GET /api/preinscripcion/<id_cohorte> ---> filtra por cohorte
@preinscripcion_bp.route('/cohorte/<int:id_cohorte>', methods = ['GET'])
def get_by_cohorte(id_cohorte):
    return PreinscripcionService.get_by_cohorte(id_cohorte)


#POST /api/preinscripcion --> crear preinscripcion
@preinscripcion_bp.route('/', methods = ['POST'])
#@token_required
#def create_preinscripcion(current_user):
def create_preinscripcion():

    data = request.get_json()

    #Validación con schema
    schema = PreinscripcionSchema()
    errores = schema.validate(data)
    if errores:
        return make_response(ResponseStatus.FAIL, "Datos invalidos", errores)
    
    return PreinscripcionService.create(data)

#PUT /api/preinscripcion/<id> --> actualizar
@preinscripcion_bp.route('/<int:id>', methods = ['PUT'])
#@token_required
#def update_preinscripcion(current_user, id):
def update_preinscripcion(id):
    data = request.get_json()

    schema = PreinscripcionSchema()
    errores = schema.validate(data)
    if errores:
        return make_response(ResponseStatus.FAIL, "Datos inválidos", errores)
    
    return PreinscripcionService.update(id,data)

#DELETE /api/preinscripcion/<id> --> borrado logico
@preinscripcion_bp.route('/<int:id>', methods = ['DELETE'])
#@token_required
#def delete_preinscripcion(current_user, id):
def delete_preinscripcion(id):
    return PreinscripcionService.delete(id)