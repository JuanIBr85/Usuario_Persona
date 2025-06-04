import json
from flask import request, Blueprint
from app.database.session import SessionLocal
from app.models.usuarios import Usuario
from app.schemas.usuarios_schema import LoginSchema
from marshmallow import ValidationError
from app.utils.response import ResponseStatus, make_response
from app.services.usuario_service import UsuarioService
from app.extensions import limiter
from app.utils.email import decodificar_token_verificacion,verificar_token_reset

usuario_bp = Blueprint("usuario", __name__)
usuario_service = UsuarioService()

@usuario_bp.route('/registro1', methods=['POST'])
def registrar_usuario1():
    
    try:
        session = SessionLocal()
        data = request.get_json()
        
        #se valida que los datos sean correctos a lo q plantea el schema con el validate de servcio_base
        ok, errors = usuario_service.validate(data)
        if not ok:
            return make_response(
                status=ResponseStatus.ERROR,
                message="Datos inválidos.",
                data=errors
            ), 400
        
        resultado = usuario_service.registrar_usuario(session, data)
        session.commit()

        return make_response(
                status=ResponseStatus.SUCCESS,
                message="El usuario se registro con exito.",
                data=resultado
        ), 200


    except ValueError as e:
        session.rollback()
        return make_response(
            status=ResponseStatus.UNAUTHORIZED,
            message=str(e)
        ),401
    
    except Exception as e:
        session.rollback()
        return make_response(
                status=ResponseStatus.ERROR,
                message=f"Error inesperado: {str(e)}"
        ), 500
    
    finally:
        session.close()
registrar_usuario1._security_metadata ={
    "is_public":True
}


@usuario_bp.route('/verificar-email', methods=['GET']) #endpoint q manda y verifica el mail de registro
def verificar_email():
    from jwt import ExpiredSignatureError, InvalidTokenError
    token = request.args.get('token', None)
    if not token:
        return make_response(
            status=ResponseStatus.ERROR,
            message="Token faltante."
        ), 400

    try:
        datos = decodificar_token_verificacion(token)
        session = SessionLocal()
        usuario = session.query(Usuario).filter_by(email_usuario=datos['email']).first()
        if not usuario:
            return make_response(
                status=ResponseStatus.ERROR, 
                message="Usuario no encontrado"
            ), 404

        usuario.email_verificado = 1
        session.commit()

        return make_response(
            status=ResponseStatus.SUCCESS,
            message="Email verificado correctamente."
        ), 200
    
    except ExpiredSignatureError:
        return make_response(
            status=ResponseStatus.ERROR, 
            message="Token expirado."
        ), 400
    
    except InvalidTokenError:
        return make_response(
            status=ResponseStatus.ERROR, 
            message="Token inválido."
        ), 400
    
    finally:
        session.close()
verificar_email._security_metadata ={
    "is_public":True
}

@usuario_bp.route('/login1', methods=['POST'])
@limiter.limit("5 per minute")
def login1():
    session = SessionLocal()
    try:
        data = request.get_json()
        try:
            data_validada = LoginSchema().load(data)
        except ValidationError as e:
            return make_response(
                status=ResponseStatus.ERROR,
                message="Error de Schema",
                data=e.messages
            ), 400
        
        resultado = usuario_service.login_usuario(
            session,
            email=data_validada["email_usuario"],
            password=data_validada["password"]
        )
        session.commit()
  
        return make_response(
                status=ResponseStatus.SUCCESS,
                message="El usuario se logueo con exito.",
                data=resultado
        ), 200

    except ValueError as e:
        session.rollback()
        return make_response(
            status=ResponseStatus.UNAUTHORIZED,
            message=str(e)
        ),401
    except Exception as e:
        session.rollback()
        return make_response(
                status=ResponseStatus.ERROR,
                message=f"Error inesperado: {str(e)}"
        ), 500
    finally:
        session.close()
login1._security_metadata ={
    "is_public":True
}

@usuario_bp.route('/perfil', methods=['GET'])
def perfil_usuario():
    datos = request.jwt_payload
    return json.dumps({"mensaje": "bienvenido al perfil"})
perfil_usuario._security_metadata = {
    "is_public":False,
    "access_permissions": ["ver_usuario"]
}


@usuario_bp.route('/recuperar-password', methods=['POST']) # endpoint de recuperacion de contraseña envia token por mail y lo codifica
def recuperar_password():   
    session=SessionLocal()
    email = request.json.get('email')
    if not email:
        return make_response(
            status=ResponseStatus.NOT_FOUND,
            message="debe introducir un email",
        ), 404


    data = usuario_service.recuperacion_password(session,email)
    return make_response(
            status=ResponseStatus.SUCCESS,
            message="Correo de recuperación enviado",
            data=data
        ),200

recuperar_password._security_metadata ={
    "is_public":True
}

@usuario_bp.route('/verificar-token-password', methods=['GET'])
def verificar_token_password():
    token = request.args.get('token')
    if not token:
        return {"status": "error", "message": "Token no proporcionado"}, 400
    try:
        email = verificar_token_reset(token)
        return {"status": "success", "message": "Token válido", "email": email}, 200
    except ValueError as e:
        return {"status": "error", "message": str(e)}, 400
verificar_token_password._security_metadata ={
    "is_public":True

}

@usuario_bp.route('/reset-password', methods=['POST'])
def reset_password():
    try:
        session = SessionLocal()
        data = request.get_json()
        token = data.get('token')
        nueva_password = data.get('password')
        nueva_password_rep = data.get('confirm_password')

        if not token or not nueva_password or not nueva_password_rep:
            return make_response(
                {"error": "Token y contraseñas son requeridos"}
            ), 400

        resultado = usuario_service.cambiar_password(session,token, nueva_password, nueva_password_rep)

        if isinstance(resultado, tuple):
            (status, message, data), code = resultado
            return make_response(status, message, data), code
        return make_response(resultado), 200


    except Exception as e:
        return make_response({"error": "Error interno del servidor", "detalle": str(e)}), 500
    
    finally:
        session.close()

reset_password._security_metadata ={
    "is_public":True

}


@usuario_bp.route('/superadmin', methods=['GET'])
def ruta_solo_superadmin():
    session=SessionLocal()
    try:
        return json.dumps({"mensaje": "Bienvenido, superadmin. Tienes acceso completo."})
    except ValueError as e:
        session.rollback()
        return make_response(
            status=ResponseStatus.UNAUTHORIZED,
            message=str(e)
        ),401
    except Exception as e:
        session.rollback()
        return make_response(
                status=ResponseStatus.ERROR,
                message=f"Error inesperado: {str(e)}"
        ), 500
    finally:
        session.close()

ruta_solo_superadmin._security_metadata = {
    "is_public":False,
    "access_permissions": ["crear_usuario"]  #  o solo uno como "admin_total"
}

@usuario_bp.route('/admin', methods=['GET'])
def ruta_solo_admin():
    return json.dumps({"mensaje": "Bienvenido, al acceso administrativo."})


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
