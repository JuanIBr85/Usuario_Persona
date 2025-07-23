import json
import traceback
from flask import render_template
from common.utils.component_request import ComponentRequest
from flask import request, Blueprint, Response
from app.database.session import SessionLocal
from app.services.usuario_service import UsuarioService
from app.utils.jwt import verificar_token_reset,verificar_token_restauracion_usuario,verificar_refresh_token_valido
from jwt import ExpiredSignatureError, InvalidTokenError
from app.models.usuarios import Usuario
from app.models.dispositivos_confiable import DispositivoConfiable
from datetime import datetime, timezone, timedelta
from common.decorators.api_access import api_access
from common.utils.response import make_response, ResponseStatus
from app.utils.jwt import decodificar_token_verificacion,generar_token_dispositivo
from app.utils.logs_utils import log_usuario_accion
from app.extensions import get_redis
from app.utils.otp_manager import revocar_refresh_token
import logging

bp = Blueprint(
    "usuario_recuperacion_pass_otp", __name__, cli_group="usuario"
)

logger = logging.getLogger(__name__)
logger_local = logging.getLogger("auth-service")
usuario_service = UsuarioService()

"""
Blueprint: usuario_recuperacion_pass_otp

Este módulo gestiona todas las rutas relacionadas con recuperación de contraseña, validación de dispositivos y rotación de tokens.

Incluye:
- Solicitud y verificación de códigos OTP.
- Cambio de contraseña mediante token validado.
- Confirmación de dispositivos confiables.
- Rotación de tokens refresh.
- Restauración de cuentas eliminadas.

Cada endpoint valida los datos de entrada, maneja sesiones de base de datos y retorna respuestas uniformes usando `make_response`.

Uso intensivo de JWT para seguridad y tokens temporales.
"""
# -----------------------------------------------------------------------------------------------------------------------------
# RECUPERACIÓN DE PASSWORD CON OTP
# -----------------------------------------------------------------------------------------------------------------------------


@bp.route("/solicitar-otp", methods=["POST"])
@api_access(
    is_public=True, 
    limiter=["2 per minute", "5 per hour"]
)
def solicitar_otp():
    """
    Inicia el proceso de recuperación de contraseña.

    Requiere:
        - JSON con campo "email".

    Funcionalidad:
        - Verifica existencia del email.
        - Genera y envía un código OTP temporal para el usuario.

    Returns:
        JSON con estado de la operación o errores.
    """
    session = SessionLocal()
    try:
        email = request.json.get("email")
        email = email.strip().lower()
        if not email:
            return (
                make_response(
                    ResponseStatus.FAIL, "Email requerido", error_code="EMAIL_REQUIRED"
                ),
                400,
            )

        status, mensaje, data, code = usuario_service.solicitar_codigo_reset(
            session, email
        )
        return make_response(status, mensaje, data), code

    except Exception as e:
        return (
            make_response(
                ResponseStatus.ERROR,
                "Error al solicitar OTP",
               {"error": str(e)},
                error_code="OTP_SOLICITUD_ERROR",
            ),
            500,
        )

    finally:
        session.close()


@bp.route("/verificar-otp", methods=["POST"])
@api_access(
    is_public=True,
    limiter=["3 per minute", "10 per hour"],
)
def verificar_otp():
    """
    Verifica que el código OTP ingresado sea válido para el email.

    Requiere:
        - JSON con "email" y "otp".

    Funcionalidad:
        - Busca OTP válido para el email.
        - Si es correcto, permite continuar con cambio de contraseña.

    Returns:
        JSON indicando éxito o error.
    """
    session = SessionLocal()
    try:
        data = request.get_json()
        email = data.get("email")
        email = email.strip().lower()
        otp = data.get("otp")

        if not email or not otp:
            return (
                make_response(
                    ResponseStatus.FAIL,
                    "Email y OTP son requeridos",
                    error_code="FALTAN_DATOS",
                ),
                400,
            )

        status, mensaje, data, code = usuario_service.verificar_otp(
            session, email, otp)
        return make_response(status, mensaje, data), code

    except Exception as e:
        return (
            make_response(
                ResponseStatus.ERROR,
                "Error al verificar OTP",
               {"error": str(e)},
                error_code="OTP_VERIFICACION_ERROR",
            ),
            500,
        )

    finally:
        session.close()


@bp.route("/reset-password-con-codigo", methods=["POST"])
@api_access(
    is_public=True, 
    limiter=["3 per minute", "12 per day"],
)
def reset_con_otp():
    """
    Permite cambiar la contraseña usando un token válido previamente emitido.

    Requiere:
        - JSON con el nuevo password y token (JWT).

    Funcionalidad:
        - Verifica validez y formato del token.
        - Cambia la contraseña del usuario correspondiente.

    Returns:
        JSON con resultado de la operación.
    """
    session = SessionLocal()
    try:
        data = request.get_json()
        token = data.get("token")

        data.pop("token", None)

        if not token:
            return (
                make_response(
                    ResponseStatus.FAIL,
                    "Token requerido",
                    error_code="NO_INPUT",
                ),
                400,
            )
        if not token or token.count(".") != 2:
            return (
                make_response(
                    ResponseStatus.UNAUTHORIZED,
                    "Token inválido o malformado",
                    error_code="TOKEN_MALFORMED",
                ),
                401,
            )

        email_from_token = verificar_token_reset(token)
        if not email_from_token:
            return make_response(
                ResponseStatus.UNAUTHORIZED,
                "Token inválido o expirado",
                error_code="TOKEN_INVALID",
            )

        status, mensaje, data, code = usuario_service.cambiar_password_con_codigo(
            session, data, token, email_from_token
        )
        return make_response(status, mensaje, data), code

    except Exception as e:
        import traceback

        traceback.print_exc()
        return (
            make_response(
                ResponseStatus.ERROR,
                "Error al cambiar contraseña",
               {"error": str(e)},
                error_code="RESET_ERROR",
            ),
            500,
        )

    finally:
        session.close()



    

@bp.route("/verificar-dispositivo", methods=["GET"])
@api_access(
    is_public=True,
    limiter=["2 per minute", "5 per hour"],
    # Cache para evitar abusos
    #cache=CacheSettings(expiration=1800, params=["token"]),
)
def verificar_dispositivo():
    """
    Confirma un nuevo dispositivo confiable a través de un token enviado por mail.

    Requiere:
        - Parámetro GET `token`.

    Funcionalidad:
        - Decodifica el token para obtener email, IP y user-agent.
        - Registra un nuevo dispositivo confiable para ese usuario.

    Returns:
        HTML de confirmación o error.
    """
    token = request.args.get("token")
    if not token:
        return "Token faltante", 400

    try:
        datos = decodificar_token_verificacion(token)

        # Extraer datos
        email = datos["email"]
        user_agent = datos.get("user_agent", "")
        ip = datos["ip"]
        jti = datos["jti"]

        # Buscar usuario
        session = SessionLocal()
        usuario = session.query(Usuario).filter_by(email_usuario=email,eliminado=False).first()
        if not usuario:
            return "Usuario no encontrado.", 404

        # Para evitar que se envie multiples veces el correo
        lock_verificar_dispositivo = get_redis().set(f"lock:verificar_dispositivo:{jti}", "true", ex=60*30, nx=True)
        
        if not lock_verificar_dispositivo:
            return render_template("error_generico.html", error="Token usado")

        # Registrar el dispositivo como confiable
        nuevo_dispositivo = DispositivoConfiable(
            usuario_id=usuario.id_usuario,
            user_agent=user_agent,
            token_dispositivo=generar_token_dispositivo(email, user_agent, ip),
            fecha_registro=datetime.now(timezone.utc),
            fecha_expira=datetime.now(timezone.utc) + timedelta(days=30),
        )

        session.add(nuevo_dispositivo)
        session.commit()

        return  render_template("dispositivo_confirmado.html")
    
    except ExpiredSignatureError:
        return "El enlace ha expirado.", 400
    except InvalidTokenError:
        return "Token inválido.", 400
    except Exception as e:
        traceback.print_exc()

        return render_template("error_generico.html", error=str(e))


@bp.route("/refresh", methods=["POST"])
@api_access(
    is_public=True,
    limiter=["2 per 1 minute", "8 per hour"],  # limitacion estricta para no dejar crear mas de 5 jti_refresh basado en los 15 min q dura el access token.
)
def refresh_token():
    """
    Rota el refresh token para obtener nuevos tokens de acceso.

    Requiere:
        - JSON con campo "refresh_token".

    Funcionalidad:
        - Verifica validez del refresh token.
        - Si es válido, genera nuevos tokens (access + refresh).

    Returns:
        JSON con nuevos tokens o error.
    """
    session = SessionLocal()
    try:
        data = request.get_json()
        token = data.get("refresh_token")

        if not token:
            return make_response(
                ResponseStatus.FAIL,
                "Token de refresh requerido",
                error_code="NO_INPUT",
            ), 400
        
        jti_access_anterior = ComponentRequest.get_jti()
        jti_refresh_anterior = ComponentRequest.get_refresh_jti()

        # Validar y decodificar manualmente el refresh token
        payload, error = verificar_refresh_token_valido(token)
        if error:
            return make_response(
                    ResponseStatus.FAIL,
                    error,
                    error_code="TOKEN_INVALID",
                ), 401
        
        status,mensaje,resultado,code = usuario_service.rotar_refresh_token(session, jti_refresh_anterior, ComponentRequest.get_user_id(), ComponentRequest.get_user_agent(), ComponentRequest.get_ip())

        if code == 200:
            if jti_access_anterior:
                get_redis().delete(jti_access_anterior)
            if jti_refresh_anterior:
                revocar_refresh_token(jti_refresh_anterior)
        
        return make_response(status, mensaje, resultado), code

    finally:
        session.close()


@bp.route("/confirmar-restauracion", methods=["GET"])
@api_access(
    is_public=True,
    limiter=["3 per minute", "5 per day"]
)
def confirmar_restauracion():
    """
    Restaura una cuenta de usuario eliminada lógicamente.

    Requiere:
        - Parámetro `token` (verificación por email).

    Funcionalidad:
        - Verifica token válido.
        - Restaura el estado del usuario (eliminado=False).

    Returns:
        HTML de cuenta restaurada o error.
    """
    token = request.args.get("token")
    try:
        session = SessionLocal()
        email = verificar_token_restauracion_usuario(token, tipo="restauracion_usuario")
        if not email:
            return render_template("token_invalido.html")
            
        usuario = session.query(Usuario).filter_by(email_usuario=email, eliminado=True).first()
        if not usuario:
            return render_template("usuario_no_encontrado.html")
            
        usuario.eliminado = False
        usuario.deleted_at = None
        session.commit()
        log_usuario_accion(session, usuario.id_usuario, "Restauración de cuenta exitosa.")
        return render_template("cuenta_restaurada.html")

    except Exception as e:
        logger.error("Error inesperado al confirmar restauración")
        logger_local.debug("Error no manejado %s", str(e))
        return make_response(
            ResponseStatus.ERROR,
            "Ocurrió un error inesperado al procesar tu solicitud.",
            str(e),
            500
        )
    finally:
        session.close()