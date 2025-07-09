from typing import Any, Literal
from app.schemas.usuarios_schema import UsuarioModificarSchema
from marshmallow import ValidationError
from common.utils.component_request import ComponentRequest
from flask import request, Blueprint, render_template
from app.database.session import SessionLocal
from app.services.usuario_service import UsuarioService
from app.models.usuarios import Usuario
from app.utils.jwt import decodificar_token_cambio_email
from common.decorators.api_access import api_access
from common.models.cache_settings import CacheSettings
from common.utils.response import make_response, ResponseStatus

bp = Blueprint(
    "usuario_login_logout", __name__, cli_group="usuario"
)

usuario_service = UsuarioService()

"""
Módulo de autenticación de usuario.

Contiene las rutas:
- POST /login: Inicio de sesión con validación de dispositivo.
- POST /logout: Finaliza sesión y limpia tokens.
- POST /modificar: Actualiza datos de perfil.
- DELETE /eliminar: Elimina al usuario (soft delete).
- GET /perfil: Devuelve los datos del usuario autenticado (con caché).

Todas las rutas están protegidas con `@api_access` y limitaciones por rate limiting y/o cache.
"""


# -----------------------------------------------------------------------------------------------------------------------------
# LOGIN Y LOGOUT
# -----------------------------------------------------------------------------------------------------------------------------


@bp.route("/login", methods=["POST"])
@api_access(
    is_public=True, 
    limiter=["5 per minute", "20 per hour"]
)
def login1():
    """
    Inicia sesión para un usuario.

    Requiere:
        - JSON con email y contraseña.
    
    Funcionalidad:
        - Valida credenciales.
        - Verifica si el dispositivo es confiable.
        - Aplica límites de acceso por IP.
        - Retorna tokens de acceso y refresh si la autenticación es exitosa.

    Returns:
        JSON con status, mensaje, datos (tokens) y código HTTP correspondiente.
    """
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
        return make_response(status, mensaje, data), code

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
def logout_usuario() -> tuple[dict[Any, Any], Any] | tuple[dict[Any, Any], Literal[500]]:
    """
    Finaliza la sesión del usuario autenticado.

    Requiere:
        - JWT válido.
        - JSON con el campo `refresh_jti`.

    Funcionalidad:
        - Invalida los tokens `access` y `refresh`.
        - Elimina el refresh token de la base de datos o blacklist.

    Returns:
        JSON indicando éxito o error, con código HTTP adecuado.
    """
    session = SessionLocal()
    try:
        data = request.get_json()
        refresh_jti = data.get("refresh_jti")
        jwt_jti = ComponentRequest.get_jti()
        usuario_id = ComponentRequest.get_user_id()
        
        if not all([jwt_jti, refresh_jti, usuario_id]):
            return make_response(
                ResponseStatus.FAIL,
                "Faltan campos obligatorios: access_jti, refresh_jti, usuario_id",
                error_code="CAMPOS_FALTANTES"
            ), 400
        
        status, mensaje, data, code = usuario_service.logout_usuario(
            session, usuario_id, jwt_jti, refresh_jti
        )
        return make_response(status, mensaje, data), code

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
    limiter=["6 per minute"],
)
def modificar_perfil():
    """
    Modifica el nombre de usuario y/o email del usuario autenticado.

    Requiere:
        - JWT válido.
        - JSON con uno o ambos campos: `nombre_usuario`, `email_usuario`.

    Funcionalidad:
        - Valida datos con `UsuarioModificarSchema`.
        - Aplica los cambios al perfil.
        - Devuelve el nuevo estado del usuario.

    Returns:
        JSON con status, mensaje y nuevos datos del perfil.
    """
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
        return make_response(status, mensaje, data), code
    
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
    limiter="2 per day",
)
def eliminar_usuario():
    """
    Elimina lógicamente al usuario autenticado.

    Requiere:
        - JWT válido.

    Funcionalidad:
        - Marca el usuario como eliminado (`eliminado = True`).
        - Setea el campo `deleted_at` con timestamp actual.

    Returns:
        JSON indicando éxito o error.
    """
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
)
def perfil_usuario():
    """
    Devuelve los datos del usuario autenticado.

    Requiere:
        - JWT válido.

    Funcionalidad:
        - Retorna nombre, email y otros datos del perfil.
        - Usa sistema de caché por `id_usuario` para mejorar rendimiento.

    Returns:
        JSON con datos del perfil del usuario y código HTTP correspondiente.
    """
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

@bp.route("/cambiar-email", methods=["POST"])
@api_access(
    is_public=False,
)
def solicitar_cambio_email():
    session = SessionLocal()
    try:
        usuario_id = ComponentRequest.get_user_id()
        data = request.get_json()
        nuevo_email = data.get("nuevo_email")
        password = data.get("password")

        if not nuevo_email or not password:
            return make_response(
                ResponseStatus.FAIL,
                "Nuevo email y contraseña requeridos",
                error_code="NO_INPUT",
            ), 400

        status, mensaje, contenido, code = usuario_service.solicitar_cambio_email(
            session, usuario_id, password, nuevo_email
        )
        return make_response(status, mensaje, contenido), code
    except Exception as e:
        return (
            make_response(
                ResponseStatus.ERROR,
                "Error al solicitar cambio de correo",
                str(e),
                error_code="CAMBIO_EMAIL_ERROR",
            ),
            500,
        )
    finally:
        session.close()


@bp.route("/confirmar-cambio-email", methods=["GET"])
@api_access(
    is_public=True,
    limiter=["1 per minute", "5 per day"],
)
def confirmar_cambio_email():
    token = request.args.get("token")
    if not token:
        return "Token faltante", 400
    session = SessionLocal()
    try:
        datos = decodificar_token_cambio_email(token)
        usuario_id = datos.get("sub")
        nuevo_email = datos.get("nuevo_email")
        usuario = session.query(Usuario).filter_by(id_usuario=usuario_id, eliminado=False).first()
        if not usuario:
            return render_template("usuario_no_encontrado.html"), 404
        usuario.email_usuario = nuevo_email
        usuario.email_verificado = False
        session.commit()
        return render_template("correo_actualizado.html", email=nuevo_email)
    except ValueError:
        return render_template("token_invalido.html"), 400
    finally:
        session.close()

