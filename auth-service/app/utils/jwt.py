from jwt import decode, encode, ExpiredSignatureError, InvalidTokenError
from datetime import datetime, timedelta, timezone
from os import getenv
from flask_jwt_extended import create_access_token
from uuid import uuid4
from app.extensions import get_redis
from typing import Optional,Tuple


def crear_token_acceso(usuario_id, email,jti_refresh):
    expires_seconds = int(getenv("JWT_ACCESS_TOKEN_EXPIRES", 60 * 15))
    expires_delta = timedelta(seconds=expires_seconds)
    expires_at = datetime.now(timezone.utc) + expires_delta

    return (
        create_access_token(
            identity=str(usuario_id),
            additional_claims={
                "sub": str(usuario_id),
                "email": email,
                "jti_refresh":jti_refresh,
                "exp": expires_at,
            },
            expires_delta=expires_delta,
        ),
        expires_at,
        expires_seconds,
    )


# borrar este metodo si el otro funciona.
def crear_token_reset_password(otp_id: int, usuario_id: int) -> str:
    payload = {
        "sub": str(usuario_id),
        "otp_id": otp_id,
        "scope": "reset_password",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=10),
    }
    return encode(payload, getenv("JWT_SECRET_KEY"), algorithm="HS256")


def generar_token_reset(email: str):
    payload = {
        "sub": email,
        "email": email,
        "type": "reset",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=10),
    }
    return encode(payload, getenv("JWT_SECRET_KEY"), algorithm="HS256")


def verificar_token_reset(token: str):
    try:
        payload = decode(
            token, getenv("JWT_SECRET_KEY"), algorithms=["HS256"]
        )
        if payload.get("type") != "reset":
            return None
        return payload.get("email")
    except (ExpiredSignatureError, InvalidTokenError):
        return None


def crear_token_refresh(usuario_id):
    jti = str(uuid4())
    expires_in = datetime.now(timezone.utc) + timedelta(days=int(getenv("JWT_REFRESH_TOKEN_EXPIRES"))
    )
    payload = {
            "sub": str(usuario_id), 
            "scope": "refresh_token",
            "exp": expires_in,
            "jti":jti,

        }
    return (encode(payload, getenv("JWT_SECRET_KEY"), algorithm="HS256"),expires_in,jti)


def verificar_refresh_token_valido(token: str) -> Tuple[Optional[dict], Optional[str]]:
    """
    Verifica que el refresh token sea válido, con scope correcto y jti registrado en Redis.
    Devuelve (payload, None) si es válido, o (None, error_str) si es inválido.
    """
    try:
        payload = decode(token, getenv("JWT_SECRET_KEY"), algorithms=["HS256"])
    except ExpiredSignatureError:
        return None, "Token de refresh expirado"
    except InvalidTokenError:
        return None, "Token inválido"

    if payload.get("scope") != "refresh_token":
        return None, "Token inválido para refresh"

    jti = payload.get("jti")
    if not jti:
        return None, "Refresh token sin JTI"

    estado_token = get_redis().get(f"refresh:{jti}")
    if not estado_token or estado_token != "valid":
        return None, "Refresh token revocado o inválido"

    return payload, None



def generar_token_restauracion(email: str) -> str:
    payload = {
        "sub": email,
        "email": email,
        "type": "restauracion_admin",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=720),
    }
    return encode(payload, getenv("JWT_SECRET_KEY"), algorithm="HS256")

def generar_token_confirmacion_usuario(email: str) -> str:
    payload = {
        "sub": email,
        "email": email,
        "type": "restauracion_usuario",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=30),
    }
    return encode(payload, getenv("JWT_SECRET_KEY"), algorithm="HS256")

def verificar_token_restauracion(token: str, tipo: str = "restauracion_admin") -> str | None:
    try:
        payload = decode(token, getenv("JWT_SECRET_KEY"), algorithms=["HS256"])
        if payload.get("type") != tipo:
            return None
        return payload.get("email")
    except (ExpiredSignatureError, InvalidTokenError):
        return None
    
def verificar_token_restauracion_usuario(token: str, tipo: str = "restauracion_usuario") -> str | None:
    try:
        payload = decode(token, getenv("JWT_SECRET_KEY"), algorithms=["HS256"])
        if payload.get("type") != tipo:
            return None
        return payload.get("email")
    except (ExpiredSignatureError, InvalidTokenError):
        return None
    
def generar_token_dispositivo(email, user_agent, ip):
    payload = {
        "email": email,
        "user_agent": user_agent,
        "ip": ip,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=30)
    }
    return encode(payload, getenv("JWT_SECRET_KEY"), algorithm='HS256')


def generar_token_verificacion(email):
    payload = {
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=30)
    }
    return encode(payload, getenv("JWT_SECRET_KEY"), algorithm='HS256')

def decodificar_token_verificacion(token: str) -> dict:
    try:
        return decode(token, getenv("JWT_SECRET_KEY"), algorithms=['HS256'])
    except ExpiredSignatureError:
        raise ValueError("Token expirado.")
    except InvalidTokenError:
        raise ValueError("Token inválido.")
    
def generar_token_modificar_email(email:str,id_usuario:int)->str:
    payload = {
        "sub": str(id_usuario),
        "nuevo_email": email,
        "type": "modificar_email",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=30),
    }
    return encode(payload, getenv("JWT_SECRET_KEY"), algorithm="HS256")

def verificar_token_modificar_email(token: str):
    try:
        payload = decode(token, getenv("JWT_SECRET_KEY"), algorithms=["HS256"])
        if payload.get("type") != "modificar_email":
            return None
        return payload
    except (ExpiredSignatureError, InvalidTokenError) as e:
        return None

def generar_token_eliminacion(id_usuario: int, user_agent:str, ip_solicitud:str, jti:str, jti_refresh: str) -> str:
    payload = {
        "sub": str(id_usuario),
        "type": "eliminar_usuario",
        "jti": jti,
        "jti_refresh": jti_refresh,
        "user_agent": user_agent,
        "ip": ip_solicitud,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=30),
    }
    return encode(payload, getenv("JWT_SECRET_KEY"), algorithm="HS256")

def verificar_token_eliminacion(token: str):
    try:
        payload = decode(token, getenv("JWT_SECRET_KEY"), algorithms=["HS256"])
        if payload.get("type") != "eliminar_usuario":
            return None
        return payload
    except (ExpiredSignatureError, InvalidTokenError) as e:
        return None