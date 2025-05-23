import json
from flask import request, Response, Blueprint
from werkzeug.security import generate_password_hash
from app.database.session import SessionLocal,engine
from app.models.usuarios import Usuario, PasswordLog,UsuarioLog
from app.models.rol import RolUsuario,Rol
from app.schemas.usuarios_schema import UsuarioSchema
from datetime import datetime, timedelta, timezone
from app.services.rol import get_rol_por_nombre

usuario_bp = Blueprint("usuario", __name__)

@usuario_bp.route('/registro', methods=['POST'])
def registrar_usuario():

    try:
        session = SessionLocal()
        data = request.get_json()

        schema = UsuarioSchema()
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

@usuario_bp.route('/login', methods=['GET', 'POST'])
def login_usuario():
    return json.dumps("login")

#para ver la tabla en sqlite3.
#          C:\Users\Fabristein\Documents\Usuario_Persona\auth-service
#      C:\Users\Fabristein\Documents\Sqlite3\Sqlite3.exe auth.db

#para iniciar el seed
#python -m app.script.seed_data