import json
from flask import request, Blueprint, jsonify
from app.database.session import SessionLocal
from app.utils.response import ResponseStatus, make_response
from app.services.usuario_service import UsuarioService
from app.extensions import limiter
from app.utils.decoradores import requiere_permisos, ruta_publica
from jwt import decode, ExpiredSignatureError, InvalidTokenError
from app.utils.email import decodificar_token_verificacion, generar_token_dispositivo
from app.models.usuarios import Usuario
from app.models.dispositivos_confiable import DispositivoConfiable
from datetime import datetime, timezone, timedelta

usuario_bp = Blueprint("usuario", __name__)
usuario_service = UsuarioService()

#-----------------------------------------------------------------------------------------------------------------------------
# REGISTRO Y VERIFICACIÓN
#-----------------------------------------------------------------------------------------------------------------------------

@usuario_bp.route('/registro', methods=['POST'])
@ruta_publica
def registrar_usuario1():
    session = SessionLocal()
    try:
        data = request.get_json()
        if not data:
            return make_response(ResponseStatus.FAIL, "Datos de entrada requeridos", error_code="NO_INPUT")

        status, mensaje, data, code = usuario_service.registrar_usuario(session, data)
        return make_response(status, mensaje, data, code), code

    except Exception as e:
        print("❌ ERROR INTERNO EN /registro:", str(e)) 
        return make_response(ResponseStatus.ERROR, "Error al registrar usuario", str(e), error_code="REGISTRO_ERROR"), 500

    finally:
        session.close()


@usuario_bp.route('/verificar-email', methods=['GET'])
@ruta_publica
def verificar_email():
    session = SessionLocal()
    try:
        token = request.args.get('token')
        if not token:
            return make_response(ResponseStatus.FAIL, "Token de verificación requerido", error_code="TOKEN_MISSING"), 400

        status, mensaje, data, code = usuario_service.verificar_email(session, token)
        return make_response(status, mensaje, data, code), code

    except Exception as e:
        return make_response(ResponseStatus.ERROR, "Error al verificar email", str(e), error_code="VERIFICACION_ERROR"), 500

    finally:
        session.close()


#-----------------------------------------------------------------------------------------------------------------------------
# LOGIN Y LOGOUT
#-----------------------------------------------------------------------------------------------------------------------------

@usuario_bp.route('/login', methods=['POST'])
@limiter.limit("5 per minute")
@ruta_publica
def login1():
    session = SessionLocal()
    try:
        data = request.get_json()
        if not data:
            return make_response(ResponseStatus.FAIL, "Datos de entrada requeridos", error_code="NO_INPUT")
        
        user_agent = request.headers.get('User-Agent', '')
        ip = request.remote_addr

        status, mensaje, data, code = usuario_service.login_usuario(session, data,user_agent,ip)
        return make_response(status, mensaje, data, code), code

    except Exception as e:
        return make_response(ResponseStatus.ERROR, "Error en login", str(e), error_code="LOGIN_ERROR"), 500

    finally:
        session.close()


@usuario_bp.route('/logout', methods=['POST'])
@requiere_permisos(["logout"])
def logout_usuario():
    session = SessionLocal()
    try:
        usuario_id = request.jwt_payload["sub"]
        status, mensaje, data, code = usuario_service.logout_usuario(session, usuario_id)
        return make_response(status, mensaje, data, code), code

    except Exception as e:
        return make_response(ResponseStatus.ERROR, "Error al hacer logout", str(e), error_code="LOGOUT_ERROR"), 500

    finally:
        session.close()


@usuario_bp.route('/perfil', methods=['GET'])
@requiere_permisos(["ver_usuario"]) 
def perfil_usuario():
    session = SessionLocal()
    try:
        usuario_id = request.jwt_payload["sub"]
        status, mensaje, data, code = usuario_service.ver_perfil(session, usuario_id)
        return make_response(status, mensaje, data, code), code

    except Exception as e:
        return make_response(ResponseStatus.ERROR, "Error al obtener perfil", str(e), error_code="PERFIL_ERROR"), 500

    finally:
        session.close()


#-----------------------------------------------------------------------------------------------------------------------------
# RECUPERACIÓN DE PASSWORD CON OTP
#-----------------------------------------------------------------------------------------------------------------------------

@usuario_bp.route('/solicitar-otp', methods=['POST'])
@ruta_publica 
def solicitar_otp():
    session = SessionLocal()
    try:
        email = request.json.get('email')
        if not email:
            return make_response(ResponseStatus.FAIL, "Email requerido", error_code="EMAIL_REQUIRED"), 400

        status, mensaje, data, code = usuario_service.solicitar_codigo_reset(session, email)
        return make_response(status, mensaje, data, code), code

    except Exception as e:
        return make_response(ResponseStatus.ERROR, "Error al solicitar OTP", str(e), error_code="OTP_SOLICITUD_ERROR"), 500

    finally:
        session.close()


@usuario_bp.route('/verificar-otp', methods=['POST'])
@ruta_publica
def verificar_otp():
    session = SessionLocal()
    try:
        data = request.get_json()
        email = data.get('email')
        otp = data.get('otp')

        if not email or not otp:
            return make_response(ResponseStatus.FAIL, "Email y OTP son requeridos", error_code="FALTAN_DATOS"), 400

        status, mensaje, data, code = usuario_service.verificar_otp(session, email, otp)
        return make_response(status, mensaje, data, code), code

    except Exception as e:
        return make_response(ResponseStatus.ERROR, "Error al verificar OTP", str(e), error_code="OTP_VERIFICACION_ERROR"), 500

    finally:
        session.close()


@usuario_bp.route('/reset-password-con-codigo', methods=['POST'])
@ruta_publica
@limiter.limit("5 per minute")
def reset_con_otp():
    session = SessionLocal()
    try:
        data = request.get_json()
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        if not data or not token:
            return make_response(ResponseStatus.FAIL, "Datos requeridos y token requeridos", error_code="NO_INPUT"), 400

        status, mensaje, data, code = usuario_service.cambiar_password_con_codigo(session, data, token)
        return make_response(status, mensaje, data, code), code

    except Exception as e:
        return make_response(ResponseStatus.ERROR, "Error al cambiar contraseña", str(e), error_code="RESET_ERROR"), 500

    finally:
        session.close()


@usuario_bp.route('/modificar', methods=['GET', 'POST'])
def modificar_perfil():
    return make_response(ResponseStatus.PENDING, "Funcionalidad en construcción"), 501

@usuario_bp.route('/verificar-dispositivo', methods=['GET'])
@ruta_publica
def verificar_dispositivo():
    token = request.args.get('token')
    if not token:
        return "Token faltante", 400

    try:
        datos = decodificar_token_verificacion(token)
    except ExpiredSignatureError:
        return "El enlace ha expirado.", 400
    except InvalidTokenError:
        return "Token inválido.", 400

    # Extraer datos
    email = datos["email"]
    user_agent = datos["user_agent"]
    ip = datos["ip"]

    # Buscar usuario
    session = SessionLocal()
    usuario = session.query(Usuario).filter_by(email_usuario=email).first()
    if not usuario:
        return "Usuario no encontrado.", 404

    # Registrar el dispositivo como confiable
    nuevo_dispositivo = DispositivoConfiable(
        usuario_id=usuario.id_usuario,
        user_agent=user_agent,
        token_dispositivo= generar_token_dispositivo(email, user_agent, ip),
        fecha_registro = datetime.now(timezone.utc),
        fecha_expira = datetime.now(timezone.utc) + timedelta(days=30)
    )
    session.add(nuevo_dispositivo)
    session.commit()

    return "Dispositivo confirmado. Ahora podés volver a iniciar sesión.", 200