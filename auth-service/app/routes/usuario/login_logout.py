import traceback
from typing import Any, Literal
from app.schemas.usuarios_schema import UsuarioModificarSchema,UsuarioModificarEmailSchema,UsuarioEliminarSchema
from marshmallow import ValidationError
from common.utils.component_request import ComponentRequest
from flask import current_app, request, Blueprint,render_template
from app.database.session import SessionLocal
from app.services.usuario_service import UsuarioService
from common.decorators.api_access import api_access
from common.models.cache_settings import CacheSettings
from common.utils.response import make_response, ResponseStatus
from app.utils.jwt import verificar_token_modificar_email,verificar_token_eliminacion
from app.extensions import get_redis
import logging

bp = Blueprint(
    "usuario_login_logout", __name__, cli_group="usuario"
)

usuario_service = UsuarioService()
logger = logging.getLogger(__name__)
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

    try:

        logger.info("→ [ROUTE] Solicitud de login recibida")
        data = request.get_json()
        if not data:
            logger.warning("→ [ROUTE] No se recibieron datos de entrada")
            return make_response(
                ResponseStatus.FAIL,
                "Datos de entrada requeridos",
                error_code="NO_INPUT",
            )
        
        errors = usuario_service.schema_login.validate(data)
        if errors:
            logger.warning("→ [ROUTE] Datos inválidos: {}".format(errors))
            return make_response(
                ResponseStatus.FAIL,
                "Datos inválidos",
                errors,
            )
    except Exception as e:
        logger.error("→ [ROUTE] Excepción en login", exc_info=e)

    session = SessionLocal()
    try:
        user_agent = ComponentRequest.get_user_agent()
        ip = ComponentRequest.get_ip()
        logger.debug(f"→ [ROUTE] IP: {ip} | User-Agent: {user_agent}")
        status, mensaje, data, code = usuario_service.login_usuario(
            session, data, user_agent, ip
        )
        logger.info(f"→ [ROUTE] Login procesado, status: {status}, code: {code}")
        return make_response(status, mensaje, data), code

    except Exception as e:
        logger.error("→ [ROUTE] Excepción en login", exc_info=e)
        try:
            session.rollback()
        except Exception as e:
            pass
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
    is_public=True#SE PUSO EN TRUE POR UNA RAZON Y SE PUSO UNA CONDICION PARA EVITAR QUE UN USUARIO SIN LOGIN PASARA
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
    usuario_id = ComponentRequest.get_user_id()

    if not usuario_id: 
        return "ok", 200

    session = SessionLocal()
    try:
        refresh_jti = ComponentRequest.get_refresh_jti()#data.get("refresh_jti")
        jwt_jti = ComponentRequest.get_jti()
        
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
def modificar_nombre_usuario():
    """
    Modifica el nombre de usuario

    Requiere:
        - JWT válido.
        - JSON con uno o ambos campos: `nombre_usuario`.

    Funcionalidad:
        - Valida datos con `UsuarioModificarSchema`.
        - Aplica el cambio al perfil.
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

        status, mensaje, data, code = usuario_service.modificar_nombre_usuario(
            session, usuario_id, nuevo_username
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

@bp.route("/cambiar-email", methods=["POST"])
@api_access(
    is_public=False, 
    limiter=["6 per minute"],
)
def modificar_email_usuario():
    """
    Modifica el email de usuario

    Requiere:
        - JWT válido.
        - JSON con campos: `email_usuario`,`password`.

    Funcionalidad:
        - Valida datos con `UsuarioModificarEmailSchema`.
        - Envia un mail para confirmación.

    Returns:
        JSON con status, mensaje.
    """
    session = SessionLocal()
    try:
        usuario_id = ComponentRequest.get_user_id()
        datos = request.get_json()
        schema = UsuarioModificarEmailSchema()
        campos = schema.load(datos)

        password = campos.get("password")
        nuevo_email = campos.get("nuevo_email")

        status, mensaje, data, code = usuario_service.modificar_email_usuario(
            session, usuario_id, nuevo_email, password
        )
        return make_response(status, mensaje, data), code
    
    except ValidationError as err:
        return make_response(ResponseStatus.FAIL, "Datos inválidos", err.messages), 400
    
    except Exception as e:
        return (
            make_response(
                ResponseStatus.ERROR,
                "Error al modificar Email",
                str(e),
                error_code="MODIFICAR_USUARIO_ERROR",
            ),
            500,
        )
    finally:
        session.close()

@bp.route("/confirmar-modificar-email", methods=["GET"])
@api_access(is_public=True)
def confirmar_cambio_email():
    """
    Endpoint para la confirmación del mail que envia la ruta /cambiar-email.

    Requiere:
        - JWT válido.
        - String con : `token`.

    Funcionalidad:
        - Recibe el token que se envia por el email.
        - Verifica que este correcto.
        - Extrae los datos.
        - Confirma al servicio que se hagan los cambios en la db.

    Returns:
        Html de exito o fallo según corresponda.
    """
    session = SessionLocal()
    token = request.args.get("token")
    try:
        if not token:
            raise ValueError("Token faltante")
        datos = verificar_token_modificar_email(token)
        if not datos:
            raise ValueError("Token inválido o expirado")
        
        nuevo_email = datos.get("nuevo_email")
        usuario_service.confirmacion_modificar_email(session,datos)
        return render_template("modificar_email_exitoso.html", email=nuevo_email)

    except Exception as e:
        session.rollback()
        return render_template("modificar_email_fallido.html", mensaje=str(e)), 400

    finally:
        session.close()


@bp.route("/solicitar-eliminacion", methods=["POST"])
@api_access(
    is_public=False, 
    limiter="2 per day",
)
def eliminar_usuario():
    """
    Envia un mail para que el usuario confirme la eliminacion de la cuenta.

    Requiere:
        - JWT válido.
        - JSON con campos: `email_usuario`,`password`.

    Funcionalidad:
        - Valida datos con `UsuarioModificarEmailSchema`.
        - Envia un mail para confirmación.
        - Marca el usuario como eliminado (`eliminado = True`).
        - Setea el campo `deleted_at` con timestamp actual.

    Returns:
        JSON indicando éxito o error.
    """
    session = SessionLocal()
    try:
        usuario_id = ComponentRequest.get_user_id()
        user_agent = ComponentRequest.get_user_agent()
        ip_solicitud = ComponentRequest.get_ip()
        jti = ComponentRequest.get_jti()
        jti_refresh = ComponentRequest.get_refresh_jti()
        datos = request.get_json()
        schema = UsuarioEliminarSchema()
        campos = schema.load(datos)

        password = campos.get("password")
        email_data = campos.get("email_usuario")

        status, mensaje, data, code = usuario_service.solicitar_eliminacion(
            session, usuario_id, email_data, password, user_agent, ip_solicitud, jti, jti_refresh
        )


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

@bp.route("/confirmar-eliminacion", methods=["GET"])
@api_access(is_public=True)
def confirmar_eliminacion_usuario():
    """
    Envia un mail para que el usuario confirme la eliminacion de la cuenta.

    Requiere:
        - JWT válido.
        - String : `token`.

    Funcionalidad:
        - Marca el usuario como eliminado (`eliminado = True`).
        - Setea el campo `deleted_at` con timestamp actual.

    Returns:
        Html indicando éxito o error.
        En el caso de exito también se explica la razon por la que no se elimina totalmente.
    """    
    session = SessionLocal()
    token = request.args.get("token")
    try:
        if not token:
            raise ValueError("Token faltante")

        datos = verificar_token_eliminacion(token)
        if not datos:
            raise ValueError("Token inválido o expirado")

        usuario_id = int(datos.get("sub"))
        jti = datos.get("jti")
        jti_refresh = datos.get("jti_refresh")

        redis = get_redis()

        # Validar si los jti existen antes de revocar
        if jti and redis.exists(jti):
            redis.delete(jti)
        if jti_refresh and redis.exists(f"refresh:{jti_refresh}"):
            redis.delete(f"refresh:{jti_refresh}")

        # Eliminar flag de eliminación pendiente (por limpieza)
        redis.delete(f"eliminacion_pendiente:{usuario_id}")

        status, mensaje, _, _ = usuario_service.eliminar_usuario(session, usuario_id)
        if status != ResponseStatus.SUCCESS:
            raise ValueError(mensaje)

        admin_email = current_app.config['ADMIN_EMAIL']

        return render_template("eliminacion_exitosa.html", admin_email=admin_email)

    except Exception as e:
        session.rollback()
        return render_template("eliminacion_fallida.html", mensaje=str(e)), 400

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

