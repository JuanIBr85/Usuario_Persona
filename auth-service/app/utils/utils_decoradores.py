import jwt
from functools import wraps
from flask import request, Response
import json
from os import getenv

# Función para obtener el payload

def obtener_payload_desde_token():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        raise ValueError("Token no proporcionado")
    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(token, getenv("JWT_SECRET_KEY", "clave_jwt_123"), algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise ValueError("Token expirado")
    except jwt.InvalidTokenError:
        raise ValueError("Token inválido")

# Decorador base: solo verifica token 

def jwt_requerido(f):
    @wraps(f)
    def funcion_decorada(*args, **kwargs):
        try:
            payload = obtener_payload_desde_token()
            request.jwt_payload = payload  
        except ValueError as e:
            return Response(
                json.dumps({"error": str(e)}),
                status=401,
                mimetype="application/json"
            )
        return f(*args, **kwargs)
    return funcion_decorada

# Decorador avanzado: usa jwt_requerido + verifica rol
def rol_requerido(rol_necesario):
    def decorador(f):
        @jwt_requerido 
        @wraps(f)
        def funcion_decorada(*args, **kwargs):
            payload = request.jwt_payload  
            if rol_usuario != rol_necesario:
                return Response(
                    json.dumps({"error": f"Acceso denegado: se requiere rol '{rol_necesario}'"}),
                    status=403,
                    mimetype="application/json"
                )
            return f(*args, **kwargs)
        return funcion_decorada
    return decorador

