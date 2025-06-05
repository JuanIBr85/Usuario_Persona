import json
from flask import request, Blueprint
from app.database.session import SessionLocal
from app.utils.response import ResponseStatus,build_response
from app.services.usuario_service import UsuarioService
from app.extensions import limiter
from app.utils.decoradores import requiere_permisos,ruta_publica
usuario_bp = Blueprint("usuario", __name__)
usuario_service = UsuarioService()


#-----------------------------------------------------------------------------------------------------------------------------
#REGISTRO Y VERIFICACIÓN
#-----------------------------------------------------------------------------------------------------------------------------

@usuario_bp.route('/registro1', methods=['POST'])
@ruta_publica
def registrar_usuario1():
    
    try:
        session = SessionLocal()
        data = request.get_json()
        
        resultado = usuario_service.registrar_usuario(session, data)
        return build_response(resultado)
    
    finally:
        session.close()



@usuario_bp.route('/verificar-email', methods=['GET']) #endpoint q manda y verifica el mail de registro
@ruta_publica
def verificar_email():
    try:
        session = SessionLocal()
        token = request.args.get('token', None)
        resultado = usuario_service.verificar_email(session, token)
        return build_response(resultado)
    
    finally:
        session.close()

#-----------------------------------------------------------------------------------------------------------------------------
#LOGIN Y LOGOUT
#-----------------------------------------------------------------------------------------------------------------------------

@usuario_bp.route('/login1', methods=['POST'])
@limiter.limit("5 per minute")
@ruta_publica
def login1():
    
    try:
        session = SessionLocal()
        data = request.get_json()
        resultado = usuario_service.login_usuario(session,data)
        return build_response(resultado)
  
    finally:
        session.close()

#El frontend al hacer logout:
#Elimina el token localmente (localStorage o cookie).
#Envía un POST a /logout con el token aún válido.
#Recibe 200 OK si todo salió bien.

@usuario_bp.route('/logout', methods=['POST'])
@requiere_permisos(["logout"])
def logout_usuario():
    session = SessionLocal()
    try:
        usuario_id = request.jwt_payload["sub"]
        resultado = usuario_service.logout_usuario(session,usuario_id)
        return build_response(resultado)

    finally:
        session.close()

logout_usuario._security_metadata = {
    "is_public": False,  # Solo usuarios autenticados pueden hacer logout
    "access_permissions": ["logout"]
}



@usuario_bp.route('/perfil', methods=['GET'])
@requiere_permisos(["ver_usuario"]) 
def perfil_usuario():
    session = SessionLocal()
    try:
        usuario_id = request.jwt_payload["sub"]
        resultado = usuario_service.ver_perfil(session, usuario_id)
        return build_response(resultado)
    finally:
        session.close()

perfil_usuario._security_metadata = {
    "is_public": False,
    "access_permissions": ["ver_usuario"]
}


#-----------------------------------------------------------------------------------------------------------------------------
#RECUPERACION DE PASSWORD CON CODIGO OTP VIA MAIL
#-----------------------------------------------------------------------------------------------------------------------------


@usuario_bp.route('/solicitar-otp', methods=['POST'])
@ruta_publica 
def solicitar_otp():
    session = SessionLocal()
    email = request.json.get('email')
    try:
        respuesta = usuario_service.solicitar_codigo_reset(session, email)
        return build_response(respuesta)
    finally:
        session.close()


@usuario_bp.route('/verificar-otp', methods=['POST'])
@ruta_publica  #definir si va a ser publica
def verificar_otp():
    session = SessionLocal()
    data = request.get_json()
    email = data.get('email')
    otp = data.get('otp')
    try:
        respuesta = usuario_service.verificar_otp(session, email, otp)
        return build_response(respuesta)
    finally:
        session.close()


@usuario_bp.route('/reset-password-con-codigo', methods=['POST'])
def reset_con_otp():  #definir si va a ser publica
    session = SessionLocal()
    data = request.get_json()
    try:
        resultado = usuario_service.cambiar_password_con_codigo(session, data)
        return build_response(resultado)
    finally:
        session.close()
reset_con_otp._security_metadata ={
    "is_public":True
}


@usuario_bp.route('/modificar', methods=['GET', 'POST'])
def modificar_perfil():
    #Agregar logica
    pass






#para iniciar el seed
#python -m app.script.seed_data
