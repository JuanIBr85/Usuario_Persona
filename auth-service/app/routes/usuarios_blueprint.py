import json
from flask import request, Response, Blueprint
from werkzeug.security import generate_password_hash
from app.database.session import SessionLocal
from app.models.usuarios import Usuario, PasswordLog
from app.schemas.usuarioo_schema import UsuarioSchema
from datetime import datetime, timedelta, timezone

usuario_bp = Blueprint("usuario", __name__)

@usuario_bp.route('/registro', methods=['POST'])
def registrar_usuario():
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

    # Establecer expiración de contraseña 
    expiracion = datetime.now(timezone.utc) + timedelta(days=365)

    # Crear un nuevo usuario
    nuevo_usuario = Usuario(
        nombre_usuario=data['nombre_usuario'],
        email_usuario=data['email_usuario'],
        password=password_hash,
        persona_id=data['persona_id'],  
        password_expira_en=expiracion
    )

    session.add(nuevo_usuario)
    session.flush()  

    # Registrar en PasswordLog
    password_log = PasswordLog(
        usuario_id=nuevo_usuario.id_usuario,
        password=password_hash,
        updated_at=datetime.now(timezone.utc)
    )
    session.add(password_log)

    session.commit()

    return Response(
        json.dumps({"mensaje": "Usuario registrado correctamente"}),
        status=201,
        mimetype='application/json'
    )


