from flask import Blueprint, Response, jsonify, request
from app.services.servicio_base import ServicioBase
from app.models.contacto_model import Contacto
from app.schema.contacto_schema import ContactoSchema
from app.utils.response_utils import ResponseStatus, make_response

contacto_bp = Blueprint('contacto_bp', __name__)
contacto_service = ServicioBase(Contacto, ContactoSchema())

# Listar contactos
@contacto_bp.route('/contactos', methods=['GET'])
def listar_contactos():
    try:
        contactos = contacto_service.get_all()

        return make_response(
            status=ResponseStatus.SUCCESS,
            message="Listado de contactos obtenido correctamente" if len(contactos)>0 else "No se encontraron resultados",
            data= contactos
        ), 200
    
    except Exception as error:
        return make_response(
            status=ResponseStatus.ERROR,
            message=f"Error interno del servidor",
            data=error
        ), 500

# Buscar contacto por ID
@contacto_bp.route('/contactos/<int:id>', methods=['GET'])
def obtener_contacto(id:int):
    try:
        contacto = contacto_service.get_by_id(id)

        return make_response(
            status=ResponseStatus.SUCCESS,
            message="Resultado encontrado" if contacto else "No se encontraron resultados",
            data= contacto 
        ), 200
    
    except Exception as error:
        return make_response(
            status=ResponseStatus.ERROR,
            message=f"Error interno del servidor",
            data=error
        ), 500

@contacto_bp.route('/crear_contacto', methods=['POST'])
def crear_contacto():
    try:
        data = request.get_json()

        if not data:
            return make_response(
                status=ResponseStatus.ERROR,
                message="No se a enviado un JSON con los datos requeridos",
                data= 404 
            ), 404

        ok, error = contacto_service.validate(data)

        if not ok:
            return make_response(
                status=ResponseStatus.ERROR,
                message="Datos enviados invalidos",
                data= error 
            ), 400

        contacto = contacto_service.create(data)

        return make_response(
            status=ResponseStatus.SUCCESS,
            message="Datos cargados correctamente",
            data= contacto 
        ), 200
    except Exception as error:
        return make_response(
            status=ResponseStatus.ERROR,
            message=f"Error interno del servidor",
            data=error
        ), 500
    
@contacto_bp.route('/actualizar_contacto/<int:id>', methods=['PUT'])
def actualizar_contacto(id:int):
    try:
        data = request.get_json()

        if not data:
            return make_response(
                status=ResponseStatus.ERROR,
                message="No se a enviado un JSON con los datos requeridos",
                data= 404 
            ), 404

        ok, error = contacto_service.validate(data, partial=True)

        if not ok:
            return make_response(
                status=ResponseStatus.ERROR,
                message="Datos enviados invalidos",
                data= error 
            ), 400

        contacto_existe = contacto_service.exist(id)

        if not contacto_existe:
            return make_response(
                status=ResponseStatus.ERROR,
                message="Contacto desconocido",
                data= 404 
            ), 404

        contacto = contacto_service.update(id, data)

        return make_response(
            status=ResponseStatus.SUCCESS,
            message="Datos actualizados correctamente",
            data= contacto 
        ), 200
    except Exception as error:
        return make_response(
            status=ResponseStatus.ERROR,
            message=f"Error interno del servidor",
            data=error
        ),500

@contacto_bp.route('/eliminar_contacto/<int:id>', methods=['DELETE'])
def eliminar_contacto(id:int):
    try:
        contacto_existe = contacto_service.exist(id)

        if not contacto_existe:
            return make_response(
                status=ResponseStatus.ERROR,
                message="Contacto desconocido",
                data= 404 
            ), 404

        contacto = contacto_service.delete(id)

        return make_response(
            status=ResponseStatus.SUCCESS,
            message="Datos eliminados correctamente",
            data= contacto 
        ), 200
    except Exception as error:
        return make_response(
            status=ResponseStatus.ERROR,
            message=f"Error interno del servidor",
            data=error
        ), 500