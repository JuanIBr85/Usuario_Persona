from flask import Blueprint, Response, jsonify, request
from app.services.servicio_base import ServicioBase
from app.models.tipo_doc_model import Tipo_Documento
from app.schema.tipo_documento_schema import TipoDocumentoSchema
from app.utils.response_utils import ResponseStatus, make_response

tipo_documento_bp = Blueprint('tipo_documento_bp', __name__)
tipo_documento_service = ServicioBase(Tipo_Documento, TipoDocumentoSchema())

# Listar tipos de documento
@tipo_documento_bp.route('/tipos_documento', methods=['GET'])
def listar_tipos_documento():
    try:
        tipos_documento = tipo_documento_service.get_all()

        return make_response(
            status=ResponseStatus.SUCCESS,
            message="Listado de tipos de documento obtenido correctamente" if len(tipos_documento)>0 else "No se encontraron resultados",
            data= tipos_documento
        ), 200
    
    except Exception as error:
        return make_response(
            status=ResponseStatus.ERROR,
            message=f"Error interno del servidor",
            data=error
        ), 500

# Buscar tipo de documento por ID
@tipo_documento_bp.route('/tipos_documento/<int:id>', methods=['GET'])
def obtener_tipo_documento(id:int):
    try:
        tipo_documento = tipo_documento_service.get_by_id(id)

        return make_response(
            status=ResponseStatus.SUCCESS,
            message="Resultado encontrado" if tipo_documento else "No se encontraron resultados",
            data= tipo_documento 
        ), 200
    
    except Exception as error:
        return make_response(
            status=ResponseStatus.ERROR,
            message=f"Error interno del servidor",
            data=error
        ), 500

@tipo_documento_bp.route('/crear_tipo_documento', methods=['POST'])
def crear_tipo_documento():
    try:
        data = request.get_json()

        if not data:
            return make_response(
                status=ResponseStatus.ERROR,
                message="No se a enviado un JSON con los datos requeridos",
                data= 404 
            ), 404

        ok, error = tipo_documento_service.validate(data)

        if not ok:
            return make_response(
                status=ResponseStatus.ERROR,
                message="Datos enviados invalidos",
                data= error 
            ), 400

        tipo_documento = tipo_documento_service.create(data)

        return make_response(
            status=ResponseStatus.SUCCESS,
            message="Datos cargados correctamente",
            data= tipo_documento 
        ), 200
    except Exception as error:
        return make_response(
            status=ResponseStatus.ERROR,
            message=f"Error interno del servidor",
            data=error
        ), 500
    
@tipo_documento_bp.route('/actualizar_tipo_documento/<int:id>', methods=['PUT'])
def actualizar_tipo_documento(id:int):
    try:
        data = request.get_json()

        if not data:
            return make_response(
                status=ResponseStatus.ERROR,
                message="No se a enviado un JSON con los datos requeridos",
                data= 404 
            ), 404

        ok, error = tipo_documento_service.validate(data, partial=True)

        if not ok:
            return make_response(
                status=ResponseStatus.ERROR,
                message="Datos enviados invalidos",
                data= error 
            ), 400

        tipo_documento_existe = tipo_documento_service.exist(id)

        if not tipo_documento_existe:
            return make_response(
                status=ResponseStatus.ERROR,
                message="Tipo de documento desconocido",
                data= 404 
            ), 404

        tipo_documento = tipo_documento_service.update(id, data)

        return make_response(
            status=ResponseStatus.SUCCESS,
            message="Datos actualizados correctamente",
            data= tipo_documento 
        ), 200
    except Exception as error:
        return make_response(
            status=ResponseStatus.ERROR,
            message=f"Error interno del servidor",
            data=error
        ),500

@tipo_documento_bp.route('/eliminar_tipo_documento/<int:id>', methods=['DELETE', 'GET'])
def eliminar_tipo_documento(id:int):
    try:
        tipo_documento_existe = tipo_documento_service.exist(id)

        if not tipo_documento_existe:
            return make_response(
                status=ResponseStatus.ERROR,
                message="Tipo de documento desconocido",
                data= 404 
            ), 404

        tipo_documento = tipo_documento_service.delete(id)

        return make_response(
            status=ResponseStatus.SUCCESS,
            message="Datos eliminados correctamente",
            data= tipo_documento 
        ), 200
    except Exception as error:
        return make_response(
            status=ResponseStatus.ERROR,
            message=f"Error interno del servidor",
            data=error
        ), 500