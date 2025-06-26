from flask import Blueprint, request
from models.egresado_model import Egresado
from models import db
from routes.auth import get_token_required
from services.egresado_service import EgresadoService
from schemas.egresado_schema import EgresadoSchema
from utils.response_utils import make_response, ResponseStatus

egresado_bp = Blueprint('egresado', __name__)

token_required = get_token_required


#Traer todos los egresados
@egresado_bp.route('/', methods = ['GET'])
def get_all_egresados():
    return EgresadoService.get_all()

#Traer egresado por ID
@egresado_bp.route('/<int:id>', methods = ['GET'])
def get_by_id(id):
    return EgresadoService.get_by_id(id)

#Traer egresados por el ID  de la cohorte
@egresado_bp.route('/cohorte/<int:id_cohorte>', methods = ['GET'])
def get_by_cohorte(id_cohorte):
    return EgresadoService.get_by_cohorte(id_cohorte)

#Crear egresado
@egresado_bp.route('/', methods = ['POST'])
#@token_required
#def create_egresado(current_user):
def create_egresado():
    data = request.get_json()

    #Validación con schema
    schema = EgresadoSchema()
    errores = schema.validate(data)
    if errores:
        return make_response(ResponseStatus.FAIL, "Datos inválidos", errores)
    
    return EgresadoService.create(data)

#Actualizar un egresado
@egresado_bp.route('/<int:id>', methods = ['PUT'])
#@token_required
#def update(current_user, id):
def update(id):
    data = request.get_json()

    schema = EgresadoSchema()
    errores = schema.validate(data)
    if errores:
        return make_response(ResponseStatus.FAIL, "Datos inválidos", errores)
    
    return EgresadoService.update(id, data)

#Eliminar logicamente un egresado (estado = 2 (inactivo))
@egresado_bp.route('/<int:id>', methods = ['DELETE'])
#@token_required
#def delete (current_user, id):
def delete(id):
    return EgresadoService.delete(id)