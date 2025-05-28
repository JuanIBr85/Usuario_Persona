import jwt
from functools import wraps
from flask import request, Response
import json
from os import getenv

def jwt_required(f):
    @wraps(f)
    def funcion_decorador(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return Response(
                json.dumps({"error": "Token no proporcionado"}),
                status=401,
                mimetype="application/json"
            )
        try:

            token = auth_header.split(" ")[1]
            payload = jwt.decode(token, getenv("JWT_SECRET_KEY", "clave_jwt_123"), algorithms=["HS256"])
         
        except jwt.ExpiredSignatureError:
            return Response(
                json.dumps({"error": "Token expirado"}),
                status=401,
                mimetype="application/json"
            )
        except jwt.InvalidTokenError:
            return Response(
                json.dumps({"error": "Token inválido"}),
                status=401,
                mimetype="application/json"
            )
        return f(*args, **kwargs)
    return funcion_decorador



def rol_required(required_rol):
    def decorador(f):
        @wraps(f)
        def funcion_decorador(*args, **kwargs):
            auth_header = request.headers.get('Authorization')
            if not auth_header:
                return Response(
                    json.dumps({"error": "Token no proporcionado"}),
                    status=401,
                    mimetype="application/json"
                )
            try:
                token = auth_header.split(" ")[1]
                payload = jwt.decode(token, getenv("JWT_SECRET_KEY", "clave_jwt_123"), algorithms=["HS256"])
                usuario_role = payload.get("rol")
                if usuario_role != required_rol:
                    return Response(
                        json.dumps({"error": f"Acceso denegado: se requiere rol '{required_rol}'"}),
                        status=403,
                        mimetype="application/json"
                    )
            except jwt.ExpiredSignatureError:
                return Response(
                    json.dumps({"error": "Token expirado"}),
                    status=401,
                    mimetype="application/json"
                )
            except jwt.InvalidTokenError:
                return Response(
                    json.dumps({"error": "Token inválido"}),
                    status=401,
                    mimetype="application/json"
                )
            return f(*args, **kwargs)
        return funcion_decorador
    return decorador

