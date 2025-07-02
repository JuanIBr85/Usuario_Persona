import json
import traceback
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

usuario_bp = Blueprint("usuario", __name__)
usuario_service = UsuarioService()

# -----------------------------------------------------------------------------------------------------------------------------
# REGISTRO Y VERIFICACIÓN
# -----------------------------------------------------------------------------------------------------------------------------


@usuario_bp.route("/registro", methods=["POST"])
@api_access(
    is_public=True, 
    limiter=["1 per minute", "5 per hour"]
)
def iniciar_registro_usuario():
    data = request.get_json()
    if not data:
        return make_response(
            ResponseStatus.FAIL, "Datos requeridos", error_code="NO_INPUT"
        )

    session = SessionLocal()
    try:
        status, mensaje, contenido, codigo = usuario_service.iniciar_registro(
            session, data
        )
        return make_response(status, mensaje, contenido), codigo
    finally:
        session.close()


@usuario_bp.route("/verificar-email", methods=["POST"])
@api_access(
    is_public=True, 
    limiter=["3 per minute , 10 per hour"], 
    cache=CacheSettings(expiration=1800, params=["email_usuario", "otp"]),
)
def confirmar_registro_usuario():
    data = request.get_json()
    email = data.get("email_usuario")
    otp = data.get("otp")
    user_agent = ComponentRequest.get_user_agent()
    if not email or not otp:
        return (
            make_response(
                ResponseStatus.FAIL,
                "Email y OTP son requeridos",
                error_code="OTP_REQUIRED",
            ),
            400,
        )

    session = SessionLocal()
    try:
        status, mensaje, contenido, codigo = usuario_service.confirmar_registro(
            session, email, otp, user_agent
        )
        return make_response(status, mensaje, contenido), codigo
    finally:
        session.close()

# -----------------------------------------------------------------------------------------------------------------------------
# LOGIN Y LOGOUT
# -----------------------------------------------------------------------------------------------------------------------------


@usuario_bp.route("/login", methods=["POST"])
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


@usuario_bp.route("/logout", methods=["POST"])
@api_access(
    is_public=False,
    access_permissions=["auth.admin.logout"],
)
def logout_usuario():
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

@usuario_bp.route("/modificar", methods=["POST"])
@api_access(
    is_public=False, 
    access_permissions=["auth.admin.modificar_usuario"],
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


@usuario_bp.route("/eliminar", methods=["DELETE"])
@api_access(
    is_public=False, 
    access_permissions=["auth.admin.eliminar_usuario"],
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


@usuario_bp.route("/perfil", methods=["GET"])
@api_access(
    is_public=False, 
    limiter=["10 per minute"],
    cache=CacheSettings(expiration=60, params=["id_usuario"]),
    access_permissions=["auth.admin.ver_usuario"],
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


# -----------------------------------------------------------------------------------------------------------------------------
# RECUPERACIÓN DE PASSWORD CON OTP
# -----------------------------------------------------------------------------------------------------------------------------


@usuario_bp.route("/solicitar-otp", methods=["POST"])
@api_access(
    is_public=True, 
    limiter=["2 per minute", "5 per hour"]
)
def solicitar_otp():
    session = SessionLocal()
    try:
        email = request.json.get("email")
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
        return make_response(status, mensaje, data, code), code

    except Exception as e:
        return (
            make_response(
                ResponseStatus.ERROR,
                "Error al solicitar OTP",
                str(e),
                error_code="OTP_SOLICITUD_ERROR",
            ),
            500,
        )

    finally:
        session.close()


@usuario_bp.route("/verificar-otp", methods=["POST"])
@api_access(
    is_public=True,
    limiter=["3 per minute", "10 per hour"],
    # 1hs previene que reenvien el token correcto para evitar abusos
    cache=CacheSettings(expiration=3600, params=["email", "otp"]),
)
def verificar_otp():
    session = SessionLocal()
    try:
        data = request.get_json()
        email = data.get("email")
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
        return make_response(status, mensaje, data, code), code

    except Exception as e:
        return (
            make_response(
                ResponseStatus.ERROR,
                "Error al verificar OTP",
                str(e),
                error_code="OTP_VERIFICACION_ERROR",
            ),
            500,
        )

    finally:
        session.close()


@usuario_bp.route("/reset-password-con-codigo", methods=["POST"])
@api_access(
    is_public=True, 
    limiter=["3 per day"],
)
def reset_con_otp():
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
        return make_response(status, mensaje, data, code), code

    except Exception as e:
        import traceback

        traceback.print_exc()
        return (
            make_response(
                ResponseStatus.ERROR,
                "Error al cambiar contraseña",
                str(e),
                error_code="RESET_ERROR",
            ),
            500,
        )

    finally:
        session.close()



    

@usuario_bp.route("/verificar-dispositivo", methods=["GET"])
@api_access(
    is_public=True,
    limiter=["2 per minute", "5 per hour"],
    # Cache para evitar abusos
    cache=CacheSettings(expiration=1800, params=["token"]),
)
def verificar_dispositivo():
    token = request.args.get("token")
    if not token:
        return "Token faltante", 400
    try:
        datos = decodificar_token_verificacion(token)

        # Extraer datos
        email = datos["email"]
        user_agent = datos.get("user_agent", "")
        ip = datos["ip"]

        # Buscar usuario
        session = SessionLocal()
        usuario = session.query(Usuario).filter_by(email_usuario=email,eliminado=False).first()
        if not usuario:
            return "Usuario no encontrado.", 404

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

        return  ("""
        <!DOCTYPE html>
        <html>
        <head>
        <title>Dispositivo confirmado</title>
        <style>
            body { font-family: sans-serif; padding: 2rem; text-align: center; }
        </style>
        </head>
        <body>
        <h1>✅ Dispositivo confirmado</h1>
        <p>Ahora podés volver a iniciar sesión.</p>
        </body>
        </html>
        """), 200
    
    except ExpiredSignatureError:
        return "El enlace ha expirado.", 400
    except InvalidTokenError:
        return "Token inválido.", 400
    except Exception as e:
        traceback.print_exc()

        return render_template_string(f"""
        <!DOCTYPE html>
        <html>
        <head>
        <title>Error al verificar</title>
        <style>
            body {{
            font-family: sans-serif;
            padding: 2rem;
            text-align: center;
            background-color: #fef2f2;
            color: #991b1b;
            }}
            h1 {{
            font-size: 1.6rem;
            }}
        </style>
        </head>
        <body>
        <h1>❌ Error al verificar el dispositivo</h1>
        <p>{str(e)}</p>
        </body>
        </html>
        """), 500


@usuario_bp.route("/refresh", methods=["POST"])
@api_access(
    is_public=True,
    limiter=["5 per minute", "20 per hour"],
)
def refresh_token():
    session = SessionLocal()
    try:
        data = request.get_json()
        token = data.get("refresh_token")

        if not token:
            return Response(
                json.dumps({"error": "Token de refresh requerido"}),
                status=400,
                mimetype="application/json",
            )

        # Validar y decodificar manualmente el refresh token
        try:
            payload = jwt.decode(
                token, getenv("JWT_SECRET_KEY", "clave_jwt_123"), algorithms=["HS256"]
            )
            if payload.get("scope") != "refresh_token":
                return Response(
                    json.dumps({"error": "Token inválido para refresh"}),
                    status=401,
                    mimetype="application/json",
                )
        except jwt.ExpiredSignatureError:
            return Response(
                json.dumps({"error": "Token de refresh expirado"}),
                status=401,
                mimetype="application/json",
            )
        except jwt.InvalidTokenError:
            return Response(
                json.dumps({"error": "Token inválido"}),
                status=401,
                mimetype="application/json",
            )

        # Usar el sub (id de usuario) para generar un nuevo access token
        usuario_id = int(payload["sub"])
        result = usuario_service.refresh_token(session, usuario_id)

        return Response(
            json.dumps(result),
            status=result.get("code", 200),
            mimetype="application/json",
        )

    finally:
        session.close()


@usuario_bp.route("/confirmar-restauracion", methods=["GET"])
@api_access(
    is_public=True,
    limiter=["1 per minute", "5 per day"]
)
def confirmar_restauracion():
    token = request.args.get("token")
    try:
        email = verificar_token_restauracion_usuario(token)
        if not email:
            return make_response(ResponseStatus.FAIL, "Token inválido o expirado", None, 400)
        
        session = SessionLocal()
        usuario = session.query(Usuario).filter_by(email_usuario=email, eliminado=True).first()

        if not usuario:
            return "Usuario no encontrado o ya restaurado.", 404

        usuario.eliminado = False
        usuario.deleted_at = None
        session.commit()

        return """
        <!DOCTYPE html>
        <html>
        <body style="font-family:sans-serif;text-align:center;padding:2rem;">
        <h1>✅ Cuenta restaurada</h1>
        <p>Ahora podés iniciar sesión con tus credenciales anteriores.</p>
        </body>
        </html>
        """, 200

    except ExpiredSignatureError:
        return "El enlace ha expirado.", 400
    except InvalidTokenError:
        return "Token inválido.", 400