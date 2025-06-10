import json
from flask import request, Blueprint, jsonify
from app.database.session import SessionLocal
from app.utils.response import ResponseStatus, make_response
from app.services.usuario_service import UsuarioService
from app.extensions import limiter
from app.utils.decoradores import requiere_permisos, ruta_publica

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

        status, mensaje, data, code = usuario_service.login_usuario(session, data)
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
