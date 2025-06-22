from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, decode_token
from app.extensions import SessionLocal
from marshmallow import ValidationError
from app.services.persona_service import PersonaService
from app.schema.persona_schema import PersonaSchema
from app.models.persona_model import Persona
from common.decorators.api_access import api_access
from common.utils.response import make_response, ResponseStatus
from common.models.cache_settings import CacheSettings


persona_bp = Blueprint("persona_bp", __name__)
persona_service = PersonaService()
persona_schema = PersonaSchema()


@api_access(
    cache=CacheSettings(expiration=30), access_permissions=["persona.admin.ver_persona"]
)
@persona_bp.route("/personas", methods=["GET"])
def listar_personas():
    try:
        personas = persona_service.listar_personas()

        return (
            make_response(
                status=ResponseStatus.SUCCESS,
                message=(
                    "Lista de personas obtenida"
                    if personas
                    else "No se encontraron resultados"
                ),
                data=personas or [],
            ),
            200,
        )

    except Exception as e:
        return (
            make_response(
                status=ResponseStatus.ERROR, message="", data={"server": str(e)}
            ),
            500,
        )


def _obtener_persona_x_id(id):

    persona = persona_service.listar_persona_id(id)

    if persona is None:

        return (
            make_response(
                status=ResponseStatus.ERROR,
                message="Persona no encontrada",
                data={"id": f"No existe persona con ID {id}"},
            ),
            404,
        )

    return (
        make_response(
            status=ResponseStatus.SUCCESS,
            message="Persona obtenida correctamente",
            data=persona,
        ),
        200,
    )


@api_access(cache=CacheSettings(expiration=10))
@persona_bp.route("/persona_by_id/<int:id>", methods=["GET"])
def persona_by_id(id):
    try:
        return _obtener_persona_x_id(id)

    except Exception as e:
        return (
            make_response(
                status=ResponseStatus.ERROR,
                message="Error al obtener persona",
                data={"server": str(e)},
            ),
            500,
        )


@api_access(
    cache=CacheSettings(expiration=10), access_permissions=["persona.admin.ver_persona"]
)
@persona_bp.route("/personas/<int:id>", methods=["GET"])
def obtener_persona(id):
    try:
        return _obtener_persona_x_id(id)

    except Exception as e:
        return (
            make_response(
                status=ResponseStatus.ERROR,
                message="Error al obtener persona",
                data={"server": str(e)},
            ),
            500,
        )


# crea una persona
@api_access(access_permissions=["persona.admin.crear_persona"])
@persona_bp.route("/crear_persona", methods=["POST"])
def crear_persona():
    try:
        data = request.get_json()

        if not data:
            return (
                make_response(
                    status=ResponseStatus.ERROR,
                    message="No se enviaron los datos",
                    data=None,
                ),
                400,
            )

        errors = persona_schema.validate(data)

        if errors:
            return (
                make_response(
                    status=ResponseStatus.ERROR,
                    message="Error de validacion",
                    data=errors,
                ),
                400,
            )

        persona = persona_service.crear_persona(data)

        return (
            make_response(
                status=ResponseStatus.SUCCESS,
                message="Recurso creado correctamente",
                data={"id": persona.id_persona},
            ),
            201,
        )

    except Exception as e:
        return (
            make_response(
                status=ResponseStatus.ERROR,
                message="Error interno del servidor",
                data={"server": str(e)},
            ),
            500,
        )


# modificar persona, siguiendo el formato json sugerido
@api_access(access_permissions=["persona.admin.modificar_persona"])
@persona_bp.route("/modificar_persona/<int:id>", methods=["PUT"])
def modificar_persona(id):
    try:
        data = request.get_json()
        if not data:
            return (
                make_response(
                    status=ResponseStatus.ERROR,
                    message="No se enviaron datos",
                    data=None,
                ),
                400,
            )

        persona = persona_service.modificar_persona(id, data)
        if persona is None:
            return (
                make_response(
                    status=ResponseStatus.ERROR,
                    message="Persona no encontrada",
                    data={"id": f"No existe persona con ID {id}"},
                ),
                404,
            )

        return (
            make_response(
                status=ResponseStatus.SUCCESS,
                message="Persona modificada correctamente",
                data=persona,
            ),
            200,
        )

    except Exception as e:
        return (
            make_response(
                status=ResponseStatus.ERROR,
                message="Error al modificar persona",
                data={"server": str(e)},
            ),
            500,
        )


@api_access()
@persona_bp.route("/modificar_persona_restringido/<int:id>", methods=["PUT"])
def modificar_persona_restringido(id):
    try:
        data = request.get_json()
        if not data:
            return (
                make_response(
                    status=ResponseStatus.ERROR,
                    message="No se enviaron datos",
                    data=None,
                ),
                400,
            )

        persona = persona_service.modificar_persona_restringido(id, data)
        if persona is None:
            return (
                make_response(
                    status=ResponseStatus.ERROR,
                    message="Persona no encontrada",
                    data={"id": f"No existe persona con ID {id}"},
                ),
                404,
            )

        return (
            make_response(
                status=ResponseStatus.SUCCESS,
                message="Persona modificada correctamente",
                data=persona,
            ),
            200,
        )

    except Exception as e:
        return (
            make_response(
                status=ResponseStatus.ERROR,
                message="Error al modificar persona",
                data={"server": str(e)},
            ),
            500,
        )


# borrar una persona
@api_access(access_permissions=["persona.admin.eliminar_persona"])
@persona_bp.route("/borrar_persona/<int:id>", methods=["DELETE"])
def borrar_persona(id):

    try:
        borrado_persona = persona_service.borrar_persona(id)

        if borrado_persona is None:
            return (
                make_response(
                    status=ResponseStatus.ERROR,
                    message="Persona no encontrada",
                    data={"id": f"No existe persona con ID {id}"},
                ),
                404,
            )

        return (
            make_response(
                status=ResponseStatus.SUCCESS, message="Persona eliminada correctamente"
            ),
            200,
        )

    except Exception as e:
        return (
            make_response(
                status=ResponseStatus.ERROR,
                message="Error al eliminar persona",
                data={"server": str(e)},
            ),
            500,
        )


# Restaurar una persona
@api_access(access_permissions=["persona.admin.restaurar_persona"])
@persona_bp.route("/restaurar_persona/<int:id>", methods=["PATCH"])
def restaurar_persona(id):

    try:
        restaura_persona = persona_service.restaurar_persona(id)

        if restaura_persona is None:
            return (
                make_response(
                    status=ResponseStatus.ERROR,
                    message="Persona no encontrada",
                    data={"id": f"No existe persona con ID {id}"},
                ),
                404,
            )

        if restaura_persona is False:
            return (
                make_response(
                    status=ResponseStatus.ERROR,
                    message="La persona no está eliminada",
                    data={
                        "id": f"La persona con ID {id} no está marcada como eliminada"
                    },
                ),
                400,
            )

        return (
            make_response(
                status=ResponseStatus.SUCCESS,
                message="Persona restaurada correctamente",
            ),
            200,
        )

    except Exception as e:
        return (
            make_response(
                status=ResponseStatus.ERROR,
                message="Error al restaurar persona",
                data={"server": str(e)},
            ),
            500,
        )


@api_access(access_permissions=[])
@persona_bp.route("/personas_by_usuario/<int:id>", methods=["GET"])
def obtener_persona_usuario(id):
    try:

        persona = persona_service.listar_persona_usuario_id(id)

        if persona is None:

            return (
                make_response(
                    status=ResponseStatus.ERROR,
                    message="Persona no encontrada",
                    data={"id": f"No existe persona con ID {id}"},
                ),
                404,
            )

        return (
            make_response(
                status=ResponseStatus.SUCCESS,
                message="Persona obtenida correctamente",
                data=persona,
            ),
            200,
        )

    except Exception as e:
        return (
            make_response(
                status=ResponseStatus.ERROR,
                message="Error al obtener persona",
                data={"server": str(e)},
            ),
            500,
        )


@api_access(access_permissions=[])
@persona_bp.route("/personas/count", methods=["GET"])
def contar_personas():
    try:
        total = persona_service.contar_personas()
        return (
            make_response(
                status=ResponseStatus.SUCCESS,
                message="Cantidad de personas obtenida",
                data={"total": total},
            ),
            200,
        )
    except Exception as e:
        return (
            make_response(
                status=ResponseStatus.ERROR,
                message="Error al contar personas",
                data={"server": str(e)},
            ),
            500,
        )


@persona_bp.route("/personas/verify", methods=["POST"])
@api_access()
def verificar_persona():
    # envia otp si el usuario confirma el mail de contacto de persona
    """
    Respuestas:
      400  Datos faltantes o inválidos
      404  Documento no registrado
      400  Email no coincide
      200 { otp_token }
    """
    try:
        usuario_id = request.headers.get("X-USER-ID")
        data = request.get_json() or {}
        tipo = data.get("tipo_documento")
        num = data.get("num_doc_persona")
        email_confirmado = data.get("email_confirmado")

        if not usuario_id or not tipo or not num or not email_confirmado:
            return make_response(ResponseStatus.FAIL, "Faltan datos necesarios"), 400

        exists, email, persona_id = persona_service.verificar_documento_mas_get_id(
            tipo, num
        )
        if not exists:
            return make_response(ResponseStatus.FAIL, "Documento no registrado"), 404

        if email.lower() != email_confirmado.lower():
            return make_response(ResponseStatus.FAIL, "Email no coincide"), 400

        otp_token = persona_service.enviar_otp(usuario_id, persona_id)
        return (
            make_response(
                ResponseStatus.PENDING, "OTP enviado", {"otp_token": otp_token}
            ),
            200,
        )
    except Exception as e:
        import traceback

        traceback.print_exc()
        return make_response(ResponseStatus.FAIL, "Error al verificar persona"), 500


# cambios para usar X-USER-ID
@api_access()
@persona_bp.route("/personas/verify-otp", methods=["POST"])
def verificar_otp_persona():

    usuario_id = request.headers.get("X-USER-ID")
    data = request.get_json() or {}
    token = data.get("otp_token")
    codigo_input = data.get("codigo")

    if not usuario_id or not token or not codigo_input:
        return make_response(ResponseStatus.FAIL, "Faltan token o código"), 400

    try:
        claims = decode_token(token)
    except Exception:
        return make_response(ResponseStatus.FAIL, "Token inválido o expirado"), 400

    if str(claims.get("sub")) != str(usuario_id):
        return make_response(ResponseStatus.FAIL, "Usuario no autorizado"), 403

    if claims.get("otp") != codigo_input:
        return make_response(ResponseStatus.FAIL, "OTP incorrecto"), 400

    # aca se vincula la persona con el usuario
    persona_service.vincular_persona(int(usuario_id), claims.get("persona_id"))
    return make_response(ResponseStatus.SUCCESS, "Persona vinculada con usuario"), 200
