import json
from flask import Flask, request, Response
from werkzeug.security import generate_password_hash
from app.database.session import SessionLocal
from app.models.models_usuarios import Usuario
from app.schemas.schemas_usuarios import UsuarioSchema

app = Flask(__name__)

@app.route('/registro', methods=['POST'])
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
        (Usuario.username == data['username']) | (Usuario.email == data['email'])
    ).first():
        return Response(
            json.dumps({"error": "El nombre de usuario o el email ya están registrados"}),
            status=409,
            mimetype='application/json'
        )

    nuevo_usuario = Usuario(
        username=data['username'],
        email=data['email'],
        password_hash=generate_password_hash(data['password'])
    )

    session.add(nuevo_usuario)
    session.commit()

    return Response(
        json.dumps({"mensaje": "Usuario registrado correctamente"}),
        status=201,
        mimetype='application/json'
    )


