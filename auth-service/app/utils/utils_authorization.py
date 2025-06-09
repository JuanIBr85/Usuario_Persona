import json
from functools import wraps
from flask import request, abort
import jwt
from os import getenv

def verificar_permisos(app):
    
    endpoint = request.endpoint
    if not endpoint:
        abort(404, description=f"Endpoint desconocido: {request.path}")
    

    if request.method == "OPTIONS":
        return

    view_func = app.view_functions.get(endpoint)
    meta = getattr(view_func, "_security_metadata", None)

    if meta is None:
        abort(401, description=f"El endpoint <{endpoint}> no está autorizado")

    if meta.get("is_public", False):
        return  # Ruta pública, pasa directo

    # Rutas protegidas → revisamos token
    auth_header = request.headers.get('X-Authorization')
 
    if not auth_header:
        abort(401, description="Token no proporcionado")

    token = auth_header.split(" ")[1]

    try:
        payload = jwt.decode(token, getenv("JWT_SECRET_KEY", "clave_jwt_123"), algorithms=["HS256"])
        permisos_usuario = set(payload.get("perms", []))
        
        permisos_necesarios = set(meta.get("access_permissions", []))
        
        if not permisos_necesarios.issubset(permisos_usuario):
            abort(403, description=f"Acceso denegado: se requieren permisos {permisos_necesarios}")

        # Opcional: podés guardar el payload para usarlo luego en la request
        request.jwt_payload = payload
 
    except jwt.ExpiredSignatureError:
        abort(401, description="Token expirado")
    except jwt.InvalidTokenError:
        abort(401, description="Token inválido")
