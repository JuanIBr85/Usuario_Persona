from jwt import decode, encode, ExpiredSignatureError, InvalidTokenError
from datetime import datetime, timedelta, timezone
from os import getenv
import jwt


def crear_token_acceso(usuario_id, email, rol, permisos):
    expires_in = datetime.now(timezone.utc) + timedelta(
        seconds=int(getenv("JWT_ACCESS_TOKEN_EXPIRES", 900))
    )
    payload = {
        "sub": str(usuario_id),
        "email": email,
        "rol": rol,
        "permisos": permisos,  # Aquí metemos la lista
        "exp": expires_in,
    }
    return (
        encode(payload, getenv("JWT_SECRET_KEY", "clave_jwt_123"), algorithm="HS256"),
        expires_in,
    )


# borrar este metodo si el otro funciona.
def crear_token_reset_password(otp_id: int, usuario_id: int) -> str:
    payload = {
        "sub": str(usuario_id),
        "otp_id": otp_id,
        "scope": "reset_password",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=10),
    }
    return encode(payload, getenv("JWT_SECRET_KEY", "clave_jwt_123"), algorithm="HS256")


def generar_token_reset(email: str):
    payload = {
        "email": email,
        "type": "reset",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=10),
    }
    return encode(payload, getenv("JWT_SECRET", "clave_jwt_123"), algorithm="HS256")


def verificar_token_reset(token: str):
    try:
        payload = decode(
            token, getenv("JWT_SECRET", "clave_jwt_123"), algorithms=["HS256"]
        )
        if payload.get("type") != "reset":
            return None
        return payload.get("email")
    except (ExpiredSignatureError, InvalidTokenError):
        return None


def crear_token_refresh(usuario_id):
    expires_in = datetime.now(timezone.utc) + timedelta(
        days=int(getenv("JWT_REFRESH_TOKEN_EXPIRES_DAYS", 7))
    )
    payload = {"sub": str(usuario_id), "scope": "refresh_token", "exp": expires_in}
    return (
        jwt.encode(
            payload, getenv("JWT_SECRET_KEY", "clave_jwt_123"), algorithm="HS256"
        ),
        expires_in,
    )
