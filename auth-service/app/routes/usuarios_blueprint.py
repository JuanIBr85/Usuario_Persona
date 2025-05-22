import json
from flask import request, Response, Blueprint
from werkzeug.security import generate_password_hash
from app.database.session import SessionLocal
from app.models.usuarios import Usuario, PasswordLog
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

        # Establecer expiración de contraseña --> pasar a models.usuarios
        expiracion = datetime.now(timezone.utc) + timedelta(days=365)


        # Crear un nuevo usuario
        nuevo_usuario = Usuario(
            nombre_usuario=data['nombre_usuario'],
            email_usuario=data['email_usuario'],
            password=password_hash,
            persona_id=data.get('persona_id', None),  
            password_expira_en=expiracion,

        )

        session.add(nuevo_usuario)
        session.flush()  

        #asigna un rol por defecto que es usuario
        rol_por_defecto = get_rol_por_nombre("usuario")  
        if not rol_por_defecto:
            return json.dumps({"error": "Rol por defecto no encontrado"}), 500
        
        relacion_rol = RolUsuario(
        id_usuario=nuevo_usuario.id_usuario,
        id_rol=rol_por_defecto.id_rol
)
        session.add(relacion_rol)

        # Registrar en PasswordLog
        password_log = PasswordLog(
            usuario_id=nuevo_usuario.id_usuario,
            password=password_hash,
            updated_at=datetime.now(timezone.utc)
        )
        session.add(password_log)

        session.commit()


        usuario_creado = {
        "id_usuario": nuevo_usuario.id_usuario,
        "nombre_usuario": nuevo_usuario.nombre_usuario,
        "email_usuario": nuevo_usuario.email_usuario,
        "persona_id": nuevo_usuario.persona_id,
        "created_at": nuevo_usuario.created_at.isoformat() if nuevo_usuario.created_at else None,
        }
        return Response(
            
            json.dumps({

                "mensaje": "Usuario registrado correctamente",
                "usuario": usuario_creado
                
                }),
            status=201,
            mimetype='application/json'
        )
    except Exception as e:
        session.rollback()
        return Response(
            json.dumps({"error": f"Error al registrar usuario: {str(e)}"}),
            status=500,
            mimetype='application/json'
        )
    finally:
        session.close()

@usuario_bp.route('/ver_usuario')
def perfil():
    return None

#para ver la tabla en sqlite3.
#          C:\Users\Fabristein\Documents\Usuario_Persona\auth-service
#      C:\Users\Fabristein\Documents\Sqlite3\Sqlite3.exe auth.db

#para iniciar el seed
#python -m app.script.seed_data