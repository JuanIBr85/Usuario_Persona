import json
from flask import request, Response, Blueprint
from werkzeug.security import generate_password_hash,check_password_hash
from app.database.session import SessionLocal
from app.models.usuarios import Usuario, PasswordLog,UsuarioLog
from app.models.rol import RolUsuario,Rol
from app.schemas.usuarios_schema import UsuarioInputSchema,LoginSchema
from datetime import datetime, timezone
from app.services.rol import get_rol_por_nombre
from app.utils.jwt import crear_token_acceso
from marshmallow import ValidationError
from app.utils.response import ResponseStatus, make_response
from app.services.usuario_service import UsuarioService
from flask_limiter import Limiter


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


@usuario_bp.route('/superadmin', methods=['GET'])
def ruta_solo_superadmin():
    return json.dumps({"mensaje": "Bienvenido, superadmin. Tienes acceso completo."})


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
