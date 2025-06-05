import json
from flask import request, Blueprint
from app.database.session import SessionLocal
from app.utils.response import ResponseStatus,build_response
from app.services.usuario_service import UsuarioService
from app.extensions import limiter
from app.utils.decoradores import requiere_permisos
usuario_bp = Blueprint("usuario", __name__)
usuario_service = UsuarioService()


#-----------------------------------------------------------------------------------------------------------------------------

#-----------------------------------------------------------------------------------------------------------------------------

@usuario_bp.route('/registro1', methods=['POST'])
def registrar_usuario1():
    
    try:
        session = SessionLocal()
        data = request.get_json()
        
        resultado = usuario_service.registrar_usuario(session, data)
        return build_response(resultado)
    
    finally:
        session.close()
registrar_usuario1._security_metadata ={
    "is_public":True
}


@usuario_bp.route('/verificar-email', methods=['GET']) #endpoint q manda y verifica el mail de registro
def verificar_email():
    try:
        session = SessionLocal()
        token = request.args.get('token', None)
        resultado = usuario_service.verificar_email(session, token)
        return build_response(resultado)
    
    finally:
        session.close()
verificar_email._security_metadata ={
    "is_public":True
}

#-----------------------------------------------------------------------------------------------------------------------------

#-----------------------------------------------------------------------------------------------------------------------------

@usuario_bp.route('/login1', methods=['POST'])
@limiter.limit("5 per minute")
def login1():
    
    try:
        session = SessionLocal()
        data = request.get_json()
        resultado = usuario_service.login_usuario(session,data)
        return build_response(resultado)
  
    finally:
        session.close()
login1._security_metadata ={
    "is_public":True
}
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
def perfil_usuario():
    datos = request.jwt_payload
    return json.dumps({"mensaje": "bienvenido al perfil"})
perfil_usuario._security_metadata = {
    "is_public":False,
    "access_permissions": ["ver_usuario"]
}


#-----------------------------------------------------------------------------------------------------------------------------

#-----------------------------------------------------------------------------------------------------------------------------


@usuario_bp.route('/solicitar-otp', methods=['POST'])
def solicitar_otp():
    session = SessionLocal()
    email = request.json.get('email')
    try:
        respuesta = usuario_service.solicitar_codigo_reset(session, email)
        return build_response(respuesta)
    finally:
        session.close()
solicitar_otp._security_metadata ={
    "is_public":True
}
@usuario_bp.route('/verificar-otp', methods=['POST'])
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
verificar_otp._security_metadata ={
    "is_public":True
}
@usuario_bp.route('/reset-password-con-codigo', methods=['POST'])
def reset_con_otp():
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


#endpoints para la recuperacion de la contraseña con un mail y token
@usuario_bp.route('/cambiar_pass', methods=['POST'])
def cambiar_password():
    #Agregar logica
    pass

@usuario_bp.route('/verificar_token', methods=['POST'])
def verificar_token_nuevo_password():
    #generar un token que se manda por mail.
    pass

@usuario_bp.route('/recuperar_pass', methods=['POST'])
def restablecer_password():
    pass




#para iniciar el seed
#python -m app.script.seed_data
