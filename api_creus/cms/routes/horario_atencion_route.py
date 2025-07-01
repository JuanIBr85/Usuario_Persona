from flask import Blueprint, request
from cms.services.horario_atencion_service import HorarioAtencionService
from cms.schemas.horario_atencion_schema import HorarioAtencionSchema
from utils.response_utils import make_response, ResponseStatus
from common.decorators.api_access import CacheSettings, api_access

horario_atencion_bp = Blueprint('horario_atencion', __name__)

schema = HorarioAtencionSchema()
schema_many = HorarioAtencionSchema(many=True)

# Obtener todos solo los horarios visibles
@horario_atencion_bp.route('/', methods=['GET'])
@api_access(is_public=True)
def obtener_horarios():
    return HorarioAtencionService.get_all_visibles()

# Obtener todos los horarios visibles y ocultos
@horario_atencion_bp.route('/todos', methods=['GET'])
@api_access(is_public=False, access_permissions=["creus.admin.ver_todos_horarios"])
def obtener_todos_horarios():
    return HorarioAtencionService.get_all()

#crear horario
@horario_atencion_bp.route('/', methods=['POST'])
@api_access(is_public=False, access_permissions=["creus.admin.crear_horario"])
def crear_horario():
    data = request.get_json()
    
    errores = schema.validate(data)
    if errores:
        return (make_response(ResponseStatus.ERROR, "Datos inválidos", errores), 400,)
    
    # Validar que hora_inicio < hora_cierre
    from datetime import datetime
    hi = datetime.strptime(data["hora_inicio"], "%H:%M")
    hc = datetime.strptime(data["hora_cierre"], "%H:%M")
    if hi >= hc:
        return (make_response(ResponseStatus.FAIL, "La hora de inicio debe ser anterior a la hora de cierre."), 400,)
    
    return HorarioAtencionService.create_horario(data)

# Actualizar un horario por ID
@horario_atencion_bp.route('/<int:id>', methods=['PUT'])
@api_access(is_public=False, access_permissions=["creus.admin.modificar_horario"])
def actualizar_horario(id):
    data = request.get_json()
    errores = schema.validate(data)
    if errores:
        return (make_response(ResponseStatus.ERROR, "Datos inválidos", errores), 400,)

    return HorarioAtencionService.update_horario(id, data)


# Eliminar (marcar como no visible) un horario por ID
@horario_atencion_bp.route('/<int:id>', methods=['DELETE'])
@api_access(is_public=False, access_permissions=["creus.admin.borrar_horario"])
def eliminar_horario(id):
    return HorarioAtencionService.delete_horario(id)

# Reordenar horarios
@horario_atencion_bp.route('/reorder', methods=['PUT'])
@api_access(is_public=False, access_permissions=["creus.admin.reordenar_horarios"])
def reordenar_horarios():
    data = request.get_json()
    if not data or 'horarios' not in data:
        return (make_response(ResponseStatus.ERROR, "Datos inválidos", {"error": "Se requiere una lista de horarios con id y posicion"}), 400,)
    
    return HorarioAtencionService.reorder_horarios(data['horarios'])