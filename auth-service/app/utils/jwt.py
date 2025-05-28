# auth/utils.py
import jwt
from datetime import datetime, timedelta, timezone
from os import getenv

def crear_token_acceso(usuario_id, email, rol):
    payload = {
        "sub": usuario_id,
        "email": email,
        "rol": rol,
        "exp": datetime.now(timezone.utc) + timedelta(seconds=int(getenv("JWT_ACCESS_TOKEN_EXPIRES", 900)))
    }
    return jwt.encode(payload, getenv("JWT_SECRET_KEY", "clave_jwt_123"), algorithm="HS256")
