from flask import Blueprint, jsonify, request
from common.utils.response import make_response, ResponseStatus
import logging
from sqlalchemy.exc import SQLAlchemyError
from config import (
    TIPOS_DOCUMENTO_VALIDOS,
    REDES_SOCIALES_VALIDAS,
    OCUPACION,
    ESTADO_CIVIL,
    ESTUDIOS_ALCANZADOS,
)
from app.services.domicilio_postal_service import DomicilioPostalService
from app.utils.email_util import censurar_email
from app.services.persona_service import PersonaService
from common.decorators.api_access import api_access
from common.models.cache_settings import CacheSettings
from app.schema.persona_vincular_schema import ValidarDocumentoSchema

opciones_bp = Blueprint("opciones_bp", __name__)

service = PersonaService()
validar_documento_schema = ValidarDocumentoSchema()

#Lista de tipos válidos de documento
@api_access(cache=CacheSettings(expiration=1))
@opciones_bp.route("/tipos_documento", methods=["GET"])
def obtener_tipos_documento():
    return (
        make_response(
            status=ResponseStatus.SUCCESS,
            message="Tipos de documento obtenidos correctamente",
            # Devuelve solo los tipos de documento
            # Lo ideal seria enviar los regex para permitir al front una validacion fiable
            # data=list(TIPOS_DOCUMENTO_VALIDOS.keys()),
            data=TIPOS_DOCUMENTO_VALIDOS,
        ),
        200,
    )

#Lista de redes sociales válidas
@api_access(cache=CacheSettings(expiration=60 * 60))
@opciones_bp.route("/redes_sociales", methods=["GET"])
def obtener_red_social():

    return (
        make_response(
            status=ResponseStatus.SUCCESS,
            message="Redes sociales obtenidos correctamente",
            data=REDES_SOCIALES_VALIDAS,
        ),
        200,
    )

#Estados civiles posibles
@api_access(cache=CacheSettings(expiration=60 * 60))
@opciones_bp.route("/estados_civiles", methods=["GET"])
def obtener_estado_civile():

    return (
        make_response(
            status=ResponseStatus.SUCCESS,
            message="Estados civiles obtenidos correctamente",
            data=ESTADO_CIVIL,
        ),
        200,
    )

#Ocupaciones disponibles
@api_access(cache=CacheSettings(expiration=60 * 60))
@opciones_bp.route("/ocupaciones", methods=["GET"])
def obtener_ocupacion():

    return (
        make_response(
            status=ResponseStatus.SUCCESS,
            message="Ocupacines obtenidos correctamente",
            data=OCUPACION,
        ),
        200,
    )

#Niveles educativos posibles
@api_access(cache=CacheSettings(expiration=60 * 60))
@opciones_bp.route("/estudios_alcanzados", methods=["GET"])
def obtener_estudios_alcanzados():

    return (
        make_response(
            status=ResponseStatus.SUCCESS,
            message="Estudios alcanzados obtenidos correctamente",
            data=ESTUDIOS_ALCANZADOS,
        ),
        200,
    )

#Localidades según el código postal
@api_access(cache=CacheSettings(expiration=60, params=["codigo_postal"]))
@opciones_bp.route("/domicilios_postales/localidades", methods=["GET"])
def buscar_localidades_por_codigo_postal():
    try:
        codigo_postal = request.args.get("codigo_postal")
        if not codigo_postal:
            return (
                make_response(
                    status=ResponseStatus.ERROR,
                    message="Debe enviar el código postal",
                    data=None,
                ),
                400,
            )

        service = DomicilioPostalService()
        localidades = service.buscar_localidades_por_codigo_postal(codigo_postal)

        if not localidades:
            return (
                make_response(
                    status=ResponseStatus.SUCCESS,
                    message="No se encontraron localidades con ese código postal",
                    data=[],
                ),
                200,
            )

        return (
            make_response(
                status=ResponseStatus.SUCCESS,
                message="Localidades encontradas",
                data=localidades,
            ),
            200,
        )
    
    except SQLAlchemyError as e:
        logging.error(f"Database error: {type(e).__name__}")
        return make_response(ResponseStatus.ERROR, str(type(e).__name__), None, "DB ERROR"), 500

    except Exception as e:
        return (
            make_response(
                status=ResponseStatus.ERROR,
                message="Error interno del servidor",
                data={"server": str(e)},
            ),
            500,
        )

#Busca un domicilio postal por código y localidad
@api_access(cache=CacheSettings(expiration=60, params=["codigo_postal", "localidad"]))
@opciones_bp.route("/domicilios_postales/buscar", methods=["GET"])
def buscar_domicilio_postal():

    try:

        codigo_postal = request.args.get("codigo_postal")
        localidad = request.args.get("localidad")

        if not localidad or not codigo_postal:
            return (
                make_response(
                    status=ResponseStatus.ERROR,
                    message="Debe enviar código_postal y localidad",
                    data=None,
                ),
                400,
            )

        service = DomicilioPostalService()
        dom_postal = service.obtener_domicilio_postal_por_cod_postal_localidad(
            codigo_postal, localidad
        )

        if not dom_postal:
            return (
                make_response(
                    status=ResponseStatus.ERROR,
                    message="No se encontró un domicilio postal con esos datos",
                    data={"codigo_postal": codigo_postal, "localidad": localidad},
                ),
                404,
            )

        return (
            make_response(
                status=ResponseStatus.SUCCESS,
                message="Domicilio postal encontrado correctamente",
                data=service.schema.dump(dom_postal),
            ),
            200,
        )
    
    except SQLAlchemyError as e:
        logging.error(f"Database error: {type(e).__name__}")
        return make_response(ResponseStatus.ERROR, str(type(e).__name__), None, "DB ERROR"), 500

    except Exception as e:
        return (
            make_response(
                status=ResponseStatus.ERROR,
                message="Error interno del servidor",
                data={"server": str(e)},
            ),
            500,
        )


# verificar documento de persona por tipo_documento y num_doc_persona
@api_access(
    limiter=["3 per minute"],
)
#Comprueba si un documento ya está registrado
@opciones_bp.route("/opciones/verificar-documento", methods=["POST"])
def verificar_documento():
    try:
        data = request.get_json() or {}

        error = validar_documento_schema.validate(data)
        if error:
            return (
                make_response(
                    status=ResponseStatus.FAIL,
                    message="Datos inválidos",
                    data=error,
                ),
                400,
            )

        validated_data = validar_documento_schema.load(data)

        tipo_documento = validated_data["tipo_documento"]
        num_doc_persona = validated_data["num_doc_persona"]

        exists, email, id_persona, usuario_id = service.verificar_documento_mas_get_id(
            tipo_documento, num_doc_persona
        ) 

        if exists and usuario_id is not None:
            logging.error(f"Documento registrado: {id_persona}")
            return (
                make_response(
                    status=ResponseStatus.SUCCESS,
                    message="Documento registrado",
                    data={"exists": True}
                ),
                430,#Para que el frontend sepa que el documento esta registrado
            )

        if not exists:
            return (
                make_response(
                    status=ResponseStatus.FAIL,
                    message="Documento no registrado",
                    data={"exists": False},
                ),
                404,
            )

        # si la persona existe censura el mail para enviarlo al frontend
        censored = censurar_email(email)

        return (
            make_response(
                status=ResponseStatus.SUCCESS,
                message="Documento registrado",
                data={"exists": True, "email": censored, "id_persona": id_persona},
            ),
            200,
        )
    except SQLAlchemyError as e:
        logging.error(f"Database error: {type(e).__name__}")
        return make_response(ResponseStatus.ERROR, str(type(e).__name__), None, "DB ERROR"), 500

    except Exception as e:
        return (
            make_response(
                status=ResponseStatus.ERROR,
                message="Error interno del servidor",
                data={"server": str(e)},
            ),
            500,
        )
