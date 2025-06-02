
import jwt
from datetime import datetime, timedelta, timezone
from os import getenv
from flask import current_app
from jwt import decode, ExpiredSignatureError, InvalidTokenError

def crear_token_acceso(usuario_id, email, rol, permisos):
    payload = {
        "sub": str(usuario_id),
        "email": email,
        "rol": rol,
        "perms": permisos,  # Aquí metemos la lista
        "exp": datetime.now(timezone.utc) + timedelta(seconds=int(getenv("JWT_ACCESS_TOKEN_EXPIRES", 900)))
    }
    return jwt.encode(payload, getenv("JWT_SECRET_KEY", "clave_jwt_123"), algorithm="HS256")



def decodificar_token_verificacion(token: str) -> dict:
    try:
        return decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
    except ExpiredSignatureError:
        raise ValueError("Token expirado.")
    except InvalidTokenError:
        raise ValueError("Token inválido.")