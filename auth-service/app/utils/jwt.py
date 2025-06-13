
import jwt
from datetime import datetime, timedelta, timezone
from os import getenv

def crear_token_acceso(usuario_id, email, rol, permisos):
    expires_in = datetime.now(timezone.utc) + timedelta(seconds=int(getenv("JWT_ACCESS_TOKEN_EXPIRES", 900)))
    payload = {
        "sub": str(usuario_id),
        "email": email,
        "rol": rol,
        "permisos": permisos,  # Aquí metemos la lista
        "exp": expires_in
    }
    return jwt.encode(payload, getenv("JWT_SECRET_KEY", "clave_jwt_123"), algorithm="HS256"), expires_in

# para mejorar se podrian crear decoradores q requieran token para el 2fa y token requerido
# para seguridad explicita o diferenciada en las rutas

def crear_token_reset_password(otp_id: int, usuario_id: int) -> str:
    payload = {
        "sub": str(usuario_id),
        "otp_id": otp_id,
        "scope": "reset_password",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=10)
    }
    return jwt.encode(payload, getenv("JWT_SECRET_KEY", "clave_jwt_123"), algorithm="HS256")