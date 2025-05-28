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

usuario_bp = Blueprint("usuario", __name__)
usuario_service = UsuarioService()

@usuario_bp.route('/registro', methods=['POST'])
def registrar_usuario():
    
    try:
        session = SessionLocal()
        data = request.get_json()

        schema = UsuarioInputSchema()
        errors = schema.validate(data)
        if errors:
            return Response(
                json.dumps(errors),
                status=400,
                mimetype='application/json'
            )

        # Verificar que el usuario no exista
        if session.query(Usuario).filter(
            (Usuario.nombre_usuario == data['nombre_usuario']) | (Usuario.email_usuario == data['email_usuario'])
        ).first():
            return Response(
                json.dumps({"error": "El nombre de usuario o el email ya están registrados"}),
                status=409,
                mimetype='application/json'
            )

        password_hash = generate_password_hash(data['password'])


        # Crear un nuevo usuario
        nuevo_usuario = Usuario(
            nombre_usuario=data['nombre_usuario'],
            email_usuario=data['email_usuario'],
            password=password_hash,
            persona_id=data.get('persona_id', None) 
        )

          
        session.add(nuevo_usuario)
        session.flush()  

        #asigna un rol por defecto que es usuario
        rol_por_defecto = get_rol_por_nombre(session,"usuario")  
        if not rol_por_defecto:
                session.rollback()
                session.close()
                return Response(
                    json.dumps({"error": "Rol por defecto no encontrado"}),
                    status=500,
                    mimetype='application/json'
                )
        
        roles = RolUsuario(
            id_usuario=nuevo_usuario.id_usuario,
            id_rol=rol_por_defecto.id_rol
        )
        session.add(roles)
        
        # Registrar en PasswordLog
        password_log = PasswordLog(
            usuario_id=nuevo_usuario.id_usuario,
            password=password_hash,
            updated_at=datetime.now(timezone.utc)
        )
        session.add(password_log)

        # registra en el usuario log.
        usuario_log = UsuarioLog(
            usuario_id=nuevo_usuario.id_usuario,
            accion= "registro",
            detalles="El usuario se registro correctamente"
        )
        session.add(usuario_log)
        session.commit()

        return Response(
            json.dumps({"mensaje": "Usuario registrado correctamente"}),
            status=201,
            mimetype='application/json'
        )
    
    except Exception as e:
        session.rollback()
        import traceback
        traceback.print_exc()
        return Response(
            json.dumps({"error": f"Error al registrar usuario: {str(e)}"}),
            status=500,
            mimetype='application/json'
        )
    finally:
        session.close()

@usuario_bp.route('/login', methods=['POST'])
def login():
    try:
        session = SessionLocal()
        data = request.get_json()
        data = request.get_json()
        try:
            validated_data = LoginSchema().load(data)
        except ValidationError as e:
            return make_response(json.dumps(
                {"error": e.messages}), 
                 status=400, 
                 mimetype="application/json")


        email = validated_data["email_usuario"]
        password = validated_data["password"]

        if not email or not password:
            return Response(json.dumps({"error": "Faltan credenciales"}), status=400, mimetype="application/json")

        usuario = session.query(Usuario).filter_by(email_usuario=email).first()
        if not usuario or not check_password_hash(usuario.password, password):
            return Response(json.dumps({"error": "Credenciales inválidas"}), status=401, mimetype="application/json")

        # rol principal de usuario
        rol_usuario = session.query(Rol).join(RolUsuario).filter(RolUsuario.id_usuario == usuario.id_usuario).first()
        rol_nombre = rol_usuario.nombre_rol if rol_usuario else "sin_rol"

        # Crea el token
        token = crear_token_acceso(usuario.id_usuario,email,rol_usuario.nombre_rol)

        usuario_log = UsuarioLog(
            usuario_id=usuario.id_usuario,
            accion= "login",
            detalles="El usuario se logueo correctamente"
        )
        session.add(usuario_log)
        session.commit()
        

        return Response(json.dumps({
            "mensaje": "Login exitoso",
            "token": token,
            "usuario": {
                "id_usuario": usuario.id_usuario,
                "nombre_usuario": usuario.nombre_usuario,
                "email_usuario": usuario.email_usuario,
                "rol": rol_nombre
            }
        }), status=200, mimetype="application/json")

    except Exception as e:
        return Response(json.dumps({"error": str(e)}), status=500, mimetype="application/json")
    finally:
        session.close()


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


@usuario_bp.route('/login1', methods=['POST'])
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

@usuario_bp.route('/ver_perfil')
def perfil_usuario():
    #Agregar logica
    pass

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