from flask import Blueprint, jsonify, request
from app.utils.respuestas import respuesta_estandar,RespuestaStatus
from config import TIPOS_DOCUMENTO_VALIDOS,REDES_SOCIALES_VALIDAS
from app.services.domicilio_postal_service import DomicilioPostalService


opciones_bp = Blueprint("opciones_bp", __name__)

@opciones_bp.route("/tipos_documento", methods=["GET"])
def obtener_tipos_documento():

    return jsonify(respuesta_estandar(
        status=RespuestaStatus.SUCCESS,
        message="Tipos de documento obtenidos correctamente",
        data=TIPOS_DOCUMENTO_VALIDOS
    )),200

@opciones_bp.route("/redes_sociales", methods=["GET"])
def obtener_red_social():

    return jsonify(respuesta_estandar(
        status=RespuestaStatus.SUCCESS,
        message="Redes sociales obtenidos correctamente",
        data=REDES_SOCIALES_VALIDAS
    )),200


@opciones_bp.route('/domicilios_postales/buscar', methods=['GET'])
def buscar_domicilio_postal():

    try:

        codigo_postal = request.args.get('codigo_postal')
        localidad = request.args.get('localidad')

        if not localidad or not codigo_postal:
            return jsonify(respuesta_estandar(
                 status=RespuestaStatus.ERROR,
                 message="Debe enviar código_postal y localidad",
                 data=None
            )),400
        
        service = DomicilioPostalService()
        dom_postal = service.obtener_id_por_cod_postal_localidad(codigo_postal, localidad)

        if not dom_postal:
            return jsonify(respuesta_estandar(
                status=RespuestaStatus.ERROR,
                message="No se encontró un domicilio postal con esos datos",
                data={"codigo_postal": codigo_postal, "localidad": localidad}
            )),404   
        
        return jsonify(respuesta_estandar(
            status=RespuestaStatus.SUCCESS,
            message="Domicilio postal encontrado correctamente",
            data=service.schema.dump(dom_postal)
        )), 200
    
    except Exception as e:
        return jsonify(respuesta_estandar(
            status=RespuestaStatus.ERROR,
            message="Error interno del servidor",
            data={"server": str(e)}
        )),500


