import json
import traceback
from typing import Any, Literal, Dict
from flask import render_template_string
from app.schemas.usuarios_schema import UsuarioModificarSchema
from marshmallow import ValidationError
from common.utils.component_request import ComponentRequest
import jwt
from os import getenv
from flask import request, Blueprint, Response
from app.database.session import SessionLocal
from app.services.usuario_service import UsuarioService
from app.extensions import limiter
from app.utils.jwt import verificar_token_reset,verificar_token_restauracion_usuario
from jwt import ExpiredSignatureError, InvalidTokenError
from app.utils.email import decodificar_token_verificacion, generar_token_dispositivo
from app.models.usuarios import Usuario
from app.models.dispositivos_confiable import DispositivoConfiable
from datetime import datetime, timezone, timedelta
from common.decorators.api_access import api_access
from common.models.cache_settings import CacheSettings
from common.utils.response import make_response, ResponseStatus

bp = Blueprint(
    "usuario_login_logout", __name__, cli_group="usuario"
)

usuario_service = UsuarioService()


# -----------------------------------------------------------------------------------------------------------------------------
# LOGIN Y LOGOUT
# -----------------------------------------------------------------------------------------------------------------------------


@bp.route("/login", methods=["POST"])
@api_access(
    is_public=True, 
    limiter=["5 per minute", "20 per hour"]
)
def login1():
    session = SessionLocal()
    try:
        data = request.get_json()
        if not data:
            return make_response(
                ResponseStatus.FAIL,
                "Datos de entrada requeridos",
                error_code="NO_INPUT",
            )

        user_agent = ComponentRequest.get_user_agent()
        ip = ComponentRequest.get_ip()
        status, mensaje, data, code = usuario_service.login_usuario(
            session, data, user_agent, ip
        )
        return make_response(status, mensaje, data, code), code

    except Exception as e:
        return (
            make_response(
                ResponseStatus.ERROR, "Error en login", str(e), error_code="LOGIN_ERROR"
            ),
            500,
        )

    finally:
        session.close()


@bp.route("/logout", methods=["POST"])
@api_access(
    is_public=False
)
def logout_usuario() -> tuple[Dict[Any, Any], Any] | tuple[Dict[Any, Any], Literal[500]]:
    session = SessionLocal()
    try:
        jwt_jti = ComponentRequest.get_jti()
        usuario_id = ComponentRequest.get_user_id()
        status, mensaje, data, code = usuario_service.logout_usuario(
            session, usuario_id, jwt_jti
        )
        return make_response(status, mensaje, data, code), code

    except Exception as e:
        return (
            make_response(
                ResponseStatus.ERROR,
                "Error al hacer logout",
                str(e),
                error_code="LOGOUT_ERROR",
            ),
            500,
        )

    finally:
        session.close()

@bp.route("/modificar", methods=["POST"])
@api_access(
    is_public=False, 
    #access_permissions=["auth.admin.modificar_usuario"],
    limiter=["6 per minute"],
)
def modificar_perfil():
    session = SessionLocal()
    try:
        usuario_id = ComponentRequest.get_user_id()
        datos = request.get_json()

        schema = UsuarioModificarSchema()
        campos = schema.load(datos)

        nuevo_username = campos.get("nombre_usuario")
        nuevo_email = campos.get("email_usuario")

        status, mensaje, data, code = usuario_service.modificar_usuario(
            session, usuario_id, nuevo_username, nuevo_email
        )
        return make_response(status, mensaje, data, code), code
    
    except ValidationError as err:
        return make_response(ResponseStatus.FAIL, "Datos inválidos", err.messages), 400
    
    except Exception as e:
        return (
            make_response(
                ResponseStatus.ERROR,
                "Error al modificar usuario",
                str(e),
                error_code="MODIFICAR_USUARIO_ERROR",
            ),
            500,
        )
    finally:
        session.close()


@bp.route("/eliminar", methods=["DELETE"])
@api_access(
    is_public=False, 
    #access_permissions=["auth.admin.eliminar_usuario"],
    limiter="2 per day",
)
def eliminar_usuario():
    session = SessionLocal()
    try:
        usuario_id = ComponentRequest.get_user_id()
        status, mensaje, data, code = usuario_service.eliminar_usuario(session, usuario_id)
        return make_response(status, mensaje, data), code

    except Exception as e:
        return make_response(
            ResponseStatus.ERROR,
            "Error al eliminar usuario",
            str(e),
            error_code="ELIMINAR_USUARIO_ERROR"
        ), 500

    finally:
        session.close()


@bp.route("/perfil", methods=["GET"])
@api_access(
    is_public=False, 
    limiter=["10 per minute"],
    cache=CacheSettings(expiration=60, params=["id_usuario"]),
    #access_permissions=["auth.admin.ver_usuario"],
)
def perfil_usuario():
    session = SessionLocal()
    try:
        usuario_id = ComponentRequest.get_user_id()
        status, mensaje, data, code = usuario_service.ver_perfil(
            session, usuario_id)
        return make_response(status, mensaje, data, code), code

    except Exception as e:
        return (
            make_response(
                ResponseStatus.ERROR,
                "Error al obtener perfil",
                str(e),
                error_code="PERFIL_ERROR",
            ),
            500,
        )

    finally:
        session.close()

