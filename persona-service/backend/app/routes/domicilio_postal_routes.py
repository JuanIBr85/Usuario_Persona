from flask import Blueprint, Response, jsonify, request
from app.services.servicio_base import ServicioBase
from app.models.domicilio_postal_model import Domicilio_Postal
from app.schema.domicilio_postal_schema import DomicilioPostalSchema
from app.utils.response_utils import ResponseStatus, make_response

domicilio_postal_bp = Blueprint('domicilio_postal_bp', __name__)
domicilio_postal_service = ServicioBase(Domicilio_Postal, DomicilioPostalSchema())

# Listar domicilios postales
@domicilio_postal_bp.route('/domicilios_postales', methods=['GET'])
def listar_domicilios_postales():
    try:
        domicilios_postales = domicilio_postal_service.get_all()

        return make_response(
            status=ResponseStatus.SUCCESS,
            message="Listado de domicilios postales obtenido correctamente" if len(domicilios_postales)>0 else "No se encontraron resultados",
            data= domicilios_postales
        ), 200
    
    except Exception as error:
        return make_response(
            status=ResponseStatus.ERROR,
            message=f"Error interno del servidor",
            data=error
        ), 500

# Buscar domicilio postal por ID
@domicilio_postal_bp.route('/domicilios_postales/<int:id>', methods=['GET'])
def obtener_domicilio_postal(id:int):
    try:
        domicilio_postal = domicilio_postal_service.get_by_id(id)

        return make_response(
            status=ResponseStatus.SUCCESS,
            message="Resultado encontrado" if domicilio_postal else "No se encontraron resultados",
            data= domicilio_postal 
        ), 200
    
    except Exception as error:
        return make_response(
            status=ResponseStatus.ERROR,
            message=f"Error interno del servidor",
            data=error
        ), 500

@domicilio_postal_bp.route('/crear_domicilio_postal', methods=['POST'])
def crear_domicilio_postal():
    try:
        data = request.get_json()

        if not data:
            return make_response(
                status=ResponseStatus.ERROR,
                message="No se a enviado un JSON con los datos requeridos",
                data= 404 
            ), 404

        ok, error = domicilio_postal_service.validate(data)

        if not ok:
            return make_response(
                status=ResponseStatus.ERROR,
                message="Datos enviados invalidos",
                data= error 
            ), 400

        domicilio_postal = domicilio_postal_service.create(data)

        return make_response(
            status=ResponseStatus.SUCCESS,
            message="Datos cargados correctamente",
            data= domicilio_postal 
        ), 200
    except Exception as error:
        return make_response(
            status=ResponseStatus.ERROR,
            message=f"Error interno del servidor",
            data=error
        ), 500
    
@domicilio_postal_bp.route('/actualizar_domicilio_postal/<int:id>', methods=['PUT'])
def actualizar_domicilio_postal(id:int):
    try:
        data = request.get_json()

        if not data:
            return make_response(
                status=ResponseStatus.ERROR,
                message="No se a enviado un JSON con los datos requeridos",
                data= 404 
            ), 404

        ok, error = domicilio_postal_service.validate(data, partial=True)

        if not ok:
            return make_response(
                status=ResponseStatus.ERROR,
                message="Datos enviados invalidos",
                data= error 
            ), 400

        domicilio_postal_existe = domicilio_postal_service.exist(id)

        if not domicilio_postal_existe:
            return make_response(
                status=ResponseStatus.ERROR,
                message="Domicilio postal desconocido",
                data= 404 
            ), 404

        domicilio_postal = domicilio_postal_service.update(id, data)

        return make_response(
            status=ResponseStatus.SUCCESS,
            message="Datos actualizados correctamente",
            data= domicilio_postal 
        ), 200
    except Exception as error:
        return make_response(
            status=ResponseStatus.ERROR,
            message=f"Error interno del servidor",
            data=error
        ),500

@domicilio_postal_bp.route('/eliminar_domicilio_postal/<int:id>', methods=['DELETE'])
def eliminar_domicilio_postal(id:int):
    try:
        domicilio_postal_existe = domicilio_postal_service.exist(id)

        if not domicilio_postal_existe:
            return make_response(
                status=ResponseStatus.ERROR,
                message="Domicilio postal desconocido",
                data= 404 
            ), 404

        domicilio_postal = domicilio_postal_service.delete(id)

        return make_response(
            status=ResponseStatus.SUCCESS,
            message="Datos eliminados correctamente",
            data= domicilio_postal 
        ), 200
    except Exception as error:
        return make_response(
            status=ResponseStatus.ERROR,
            message=f"Error interno del servidor",
            data=error
        ), 500