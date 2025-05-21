import json
from flask import Flask, request, Response , Blueprint
from werkzeug.security import generate_password_hash
from app.database.session import SessionLocal
from app.models.models_usuarios import Usuario
from app.schemas.schemas_usuarios import UsuarioSchema

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

    # Verificar si el usuario ya existe
    if session.query(Usuario).filter(
        (Usuario.nombre_usuario == data['nombre_usuario']) | (Usuario.email_usuario == data['email_usuario'])
    ).first():
        return Response(
            json.dumps({"error": "El nombre de usuario o el email ya están registrados"}),
            status=409,
            mimetype='application/json'
        )

    nuevo_usuario = Usuario(
        nombre_usuario=data['nombre_usuario'],
        email_usuario=data['email_usuario'],
        password=generate_password_hash(data['password'])
    )

    session.add(nuevo_usuario)
    session.commit()

    return Response(
        json.dumps({"mensaje": "Usuario registrado correctamente"}),
        status=201,
        mimetype='application/json'
    )


