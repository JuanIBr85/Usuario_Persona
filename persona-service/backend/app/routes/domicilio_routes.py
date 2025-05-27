from flask import Blueprint, Response, jsonify, request
from app.services.servicio_base import ServicioBase
from app.models.domicilio_model import Domicilio
from app.schema.domicilio_schema import DomicilioSchema
from app.utils.response_utils import ResponseStatus, make_response

domicilio_bp = Blueprint('domicilio_bp', __name__)
domicilio_service = ServicioBase(Domicilio, DomicilioSchema())

# Listar domicilios
@domicilio_bp.route('/domicilios', methods=['GET'])
def listar_domicilios():
    try:
        domicilios = domicilio_service.get_all()

        return make_response(
            status=ResponseStatus.SUCCESS,
            message="Listado de domicilios obtenido correctamente" if len(domicilios)>0 else "No se encontraron resultados",
            data= domicilios
        ), 200
    
    except Exception as error:
        return make_response(
            status=ResponseStatus.ERROR,
            message=f"Error interno del servidor",
            data=error
        ), 500

# Buscar domicilio por ID
@domicilio_bp.route('/domicilios/<int:id>', methods=['GET'])
def obtener_domicilio(id:int):
    try:
        domicilio = domicilio_service.get_by_id(id)

        return make_response(
            status=ResponseStatus.SUCCESS,
            message="Resultado encontrado" if domicilio else "No se encontraron resultados",
            data= domicilio 
        ), 200
    
    except Exception as error:
        return make_response(
            status=ResponseStatus.ERROR,
            message=f"Error interno del servidor",
            data=error
        ), 500

@domicilio_bp.route('/crear_domicilio', methods=['POST'])
def crear_domicilio():
    try:
        data = request.get_json()

        if not data:
            return make_response(
                status=ResponseStatus.ERROR,
                message="No se a enviado un JSON con los datos requeridos",
                data= 404 
            ), 404

        ok, error = domicilio_service.validate(data)

        if not ok:
            return make_response(
                status=ResponseStatus.ERROR,
                message="Datos enviados invalidos",
                data= error 
            ), 400

        domicilio = domicilio_service.create(data)

        return make_response(
            status=ResponseStatus.SUCCESS,
            message="Datos cargados correctamente",
            data= domicilio 
        ), 200
    except Exception as error:
        return make_response(
            status=ResponseStatus.ERROR,
            message=f"Error interno del servidor",
            data=error
        ), 500
    
@domicilio_bp.route('/actualizar_domicilio/<int:id>', methods=['PUT'])
def actualizar_domicilio(id:int):
    try:
        data = request.get_json()

        if not data:
            return make_response(
                status=ResponseStatus.ERROR,
                message="No se a enviado un JSON con los datos requeridos",
                data= 404 
            ), 404

        ok, error = domicilio_service.validate(data, partial=True)

        if not ok:
            return make_response(
                status=ResponseStatus.ERROR,
                message="Datos enviados invalidos",
                data= error 
            ), 400

        domicilio_existe = domicilio_service.exist(id)

        if not domicilio_existe:
            return make_response(
                status=ResponseStatus.ERROR,
                message="Domicilio desconocido",
                data= 404 
            ), 404

        domicilio = domicilio_service.update(id, data)

        return make_response(
            status=ResponseStatus.SUCCESS,
            message="Datos actualizados correctamente",
            data= domicilio 
        ), 200
    except Exception as error:
        return make_response(
            status=ResponseStatus.ERROR,
            message=f"Error interno del servidor",
            data=error
        ),500

@domicilio_bp.route('/eliminar_domicilio/<int:id>', methods=['DELETE'])
def eliminar_domicilio(id:int):
    try:
        domicilio_existe = domicilio_service.exist(id)

        if not domicilio_existe:
            return make_response(
                status=ResponseStatus.ERROR,
                message="Domicilio desconocido",
                data= 404 
            ), 404

        domicilio = domicilio_service.delete(id)

        return make_response(
            status=ResponseStatus.SUCCESS,
            message="Datos eliminados correctamente",
            data= domicilio 
        ), 200
    except Exception as error:
        return make_response(
            status=ResponseStatus.ERROR,
            message=f"Error interno del servidor",
            data=error
        ), 500