
import jwt
from datetime import datetime, timedelta, timezone
from os import getenv
from flask_jwt_extended import create_access_token

def crear_token_acceso(usuario_id, email, rol, permisos):
    expires_delta = timedelta(seconds=int(getenv("JWT_ACCESS_TOKEN_EXPIRES", 900)))

    return create_access_token(
        identity=str(usuario_id),
        additional_claims={
            "sub": str(usuario_id),
            "email": email,
            "rol": rol,
            "perms": permisos,
            "exp": datetime.now(timezone.utc) + expires_delta
        },
        expires_delta=expires_delta
    )

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