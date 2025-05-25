from flask import Blueprint, Response, jsonify, request
from app.services.servicio_base import ServicioBase
from app.models.persona_model import Persona
from app.schema.persona_schema import PersonaSchema
from app.utils.response_utils import ResponseStatus, make_response

persona_bp = Blueprint('persona_bp', __name__)
persona_service = ServicioBase(Persona, PersonaSchema())

# Listar personas
@persona_bp.route('/personas', methods=['GET'])
def listar_personas():
    try:
        personas = persona_service.get_all()

        return make_response(
            status=ResponseStatus.SUCCESS,
            message="Listado de personas obtenido correctamente" if len(personas)>0 else "No se encontraron resultados",
            data= personas
        ), 200
    
    except Exception as error:
        return make_response(
            status=ResponseStatus.ERROR,
            message=f"Error interno del servidor",
            data=error
        ), 500

# Buscar persona por ID
@persona_bp.route('/personas/<int:id>', methods=['GET'])
def obtener_persona(id:int):
    try:
        persona = persona_service.get_by_id(id)

        return make_response(
            status=ResponseStatus.SUCCESS,
            message="Resultado encontrado" if persona else "No se encontraron resultados",
            data= persona 
        ), 200
    
    except Exception as error:
        return make_response(
            status=ResponseStatus.ERROR,
            message=f"Error interno del servidor",
            data=error
        ), 500

@persona_bp.route('/crear_persona', methods=['POST'])
def crear_persona():
    try:
        data = request.get_json()

        if not data:
            return make_response(
                status=ResponseStatus.ERROR,
                message="No se a enviado un JSON con los datos requeridos",
                data= 404 
            ), 404

        ok, error = persona_service.validate(data)

        if not ok:
            return make_response(
                status=ResponseStatus.ERROR,
                message="Datos enviados invalidos",
                data= error 
            ), 400

        persona = persona_service.create(data)

        return make_response(
            status=ResponseStatus.SUCCESS,
            message="Datos cargados correctamente",
            data= persona 
        ), 200
    except Exception as error:
        return make_response(
            status=ResponseStatus.ERROR,
            message=f"Error interno del servidor",
            data=error
        ), 500
    
@persona_bp.route('/actualizar_datos/<int:id>', methods=['PUT'])
def actualizar_datos(id:int):
    try:
        data = request.get_json()

        if not data:
            return make_response(
                status=ResponseStatus.ERROR,
                message="No se a enviado un JSON con los datos requeridos",
                data= 404 
            ), 404

        ok, error = persona_service.validate(data, partial=True)

        if not ok:
            return make_response(
                status=ResponseStatus.ERROR,
                message="Datos enviados invalidos",
                data= error 
            ), 400

        persona_existe = persona_service.exist(id)

        if not persona_existe:
            return make_response(
                status=ResponseStatus.ERROR,
                message="Persona desconocida",
                data= 404 
            ), 404

        persona = persona_service.update(id, data)

        return make_response(
            status=ResponseStatus.SUCCESS,
            message="Datos actualizados correctamente",
            data= persona 
        ), 200
    except Exception as error:
        return make_response(
            status=ResponseStatus.ERROR,
            message=f"Error interno del servidor",
            data=error
        ),500

@persona_bp.route('/eliminar_persona/<int:id>', methods=['DELETE'])
def eliminar_persona(id:int):
    try:
        persona_existe = persona_service.exist(id)

        if not persona_existe:
            return make_response(
                status=ResponseStatus.ERROR,
                message="Persona desconocida",
                data= 404 
            ), 404

        persona = persona_service.delete(id)

        return make_response(
            status=ResponseStatus.SUCCESS,
            message="Datos eliminados correctamente",
            data= persona 
        ), 200
    except Exception as error:
        return make_response(
            status=ResponseStatus.ERROR,
            message=f"Error interno del servidor",
            data=error
        ), 500