from flask import Blueprint, request
from cms.services.horario_atencion_service import HorarioAtencionService
from cms.schemas.horario_atencion_schema import HorarioAtencionSchema
from routes.auth import get_token_required
from utils.response_utils import make_response, ResponseStatus

horario_atencion_bp = Blueprint('horario_atencion', __name__)
token_required = get_token_required()

schema = HorarioAtencionSchema()
schema_many = HorarioAtencionSchema(many=True)

# Obtener todos solo los horarios visibles
@horario_atencion_bp.route('/', methods=['GET'])
def obtener_horarios():
    return HorarioAtencionService.get_all_visibles()

# Obtener todos los horarios 
@horario_atencion_bp.route('/todos', methods=['GET'])
def obtener_todos_horarios():
    return HorarioAtencionService.get_all()

#crear horario
@horario_atencion_bp.route('/', methods=['POST'])
def crear_horario():
    data = request.get_json()
    
    errores = schema.validate(data)
    if errores:
        return make_response(ResponseStatus.ERROR, "Datos inválidos", errores)
    
    # Validar que hora_inicio < hora_cierre
    from datetime import datetime
    hi = datetime.strptime(data["hora_inicio"], "%H:%M")
    hc = datetime.strptime(data["hora_cierre"], "%H:%M")
    if hi >= hc:
        return make_response(ResponseStatus.FAIL, "La hora de inicio debe ser anterior a la hora de cierre.")
    
    return HorarioAtencionService.create_horario(data)

# Actualizar un horario por ID
@horario_atencion_bp.route('/<int:id>', methods=['PUT'])
# @token_required
# def actualizar_horario(current_user, id):
def actualizar_horario(id):
    data = request.get_json()
    errores = schema.validate(data)
    if errores:
        return make_response(ResponseStatus.ERROR, "Datos inválidos", errores)

    return HorarioAtencionService.update_horario(id, data)


# Eliminar (marcar como no visible) un horario por ID
@horario_atencion_bp.route('/<int:id>', methods=['DELETE'])
# @token_required
# def eliminar_horario(current_user, id):
def eliminar_horario(id):
    return HorarioAtencionService.delete_horario(id)