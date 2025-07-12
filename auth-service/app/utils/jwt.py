from jwt import decode, encode, ExpiredSignatureError, InvalidTokenError
from datetime import datetime, timedelta, timezone
from os import getenv
from flask_jwt_extended import create_access_token
from uuid import uuid4
from app.extensions import get_redis
from typing import Optional,Tuple
import logging
logger = logging.getLogger(__name__)

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
            logger.error("[verificar_token_reset] Type inválido", exc_info=None)
            return None
        return payload.get("email")
    except ExpiredSignatureError as e:
        logger.error("[verificar_token_reset] Token expirado", exc_info=e)
        return None
    except InvalidTokenError as e:
        logger.error("[verificar_token_reset] Token inválido", exc_info=e)
        return None


def crear_token_refresh(usuario_id):
    jti = str(uuid4())
    expires_in = datetime.now(timezone.utc) + timedelta(days=int(getenv("JWT_REFRESH_TOKEN_EXPIRES"))
    )
    payload = {
            "sub": str(usuario_id), 
            "type": "refresh_token",
            "exp": expires_in,
            "jti":jti,

        }
    return (encode(payload, getenv("JWT_SECRET_KEY"), algorithm="HS256"),expires_in,jti)


def verificar_refresh_token_valido(token: str) -> Tuple[Optional[dict], Optional[str]]:
    """
    Verifica que el refresh token sea válido, con scope correcto y jti registrado en Redis.
    Devuelve una tupla (payload, None) si es válido, o (None, error_str) si es inválido.
    """
    try:
        payload = decode(token, getenv("JWT_SECRET_KEY"), algorithms=["HS256"])
    except ExpiredSignatureError as e:
        logger.error("[verificar_refresh_token_valido] Token refresh expirado", exc_info=e)
        return None, "Token de refresh expirado"
    except InvalidTokenError as e:
        logger.error("[verificar_refresh_token_valido] Token refresh inválido", exc_info=e)
        return None, "Token inválido"

    if payload.get("type") != "refresh_token":
        logger.error("[verificar_refresh_token_valido] Token inválido para refresh", exc_info=None)
        return None, "Token inválido para refresh"

    jti = payload.get("jti")
    if not jti:
        logger.error("[verificar_refresh_token_valido] Refresh token sin JTI", exc_info=None)
        return None, "Refresh token sin JTI"

    estado_token = get_redis().get(f"refresh:{jti}")
    if not estado_token or estado_token != "valid":
        logger.error("[verificar_refresh_token_valido] Refresh token revocado o inválido", exc_info=None)
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
            logger.error("[verificar_token_restauracion] Type inválido", exc_info=None)
            return None
        return payload.get("email")
    except ExpiredSignatureError as e:
        logger.error("[verificar_token_restauracion] Token expirado", exc_info=e)
        return None
    except InvalidTokenError as e:
        logger.error("[verificar_token_restauracion] Token inválido", exc_info=e)
        return None
    
def verificar_token_restauracion_usuario(token: str, tipo: str = "restauracion_usuario") -> str | None:
    try:
        payload = decode(token, getenv("JWT_SECRET_KEY"), algorithms=["HS256"])
        if payload.get("type") != tipo:
            logger.error("[verificar_token_restauracion_usuario] Type inválido", exc_info=None)
            return None
        return payload.get("email")
    except ExpiredSignatureError as e:
        logger.error("[verificar_token_restauracion_usuario] Token expirado", exc_info=e)
        return None
    except InvalidTokenError as e:
        logger.error("[verificar_token_restauracion_usuario] Token inválido", exc_info=e)
        return None
    
def generar_token_dispositivo(email, user_agent, ip):
    payload = {
        "email": email,
        "user_agent": user_agent,
        "ip": ip,
        "type": "verificar_dispositivo",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=30)
    }
    return encode(payload, getenv("JWT_SECRET_KEY"), algorithm='HS256')


def decodificar_token_verificacion(token: str,tipo: str = "verificar_dispositivo") -> dict:
    try:
        payload = decode(token, getenv("JWT_SECRET_KEY"), algorithms=["HS256"])
        if payload.get("type") != tipo:
            logger.error("[decodificar_token_verificacion] Type inválido", exc_info=None)
            return None
    except ExpiredSignatureError as e:
        logger.error("[decodificar_token_verificacion] Token expirado", exc_info=e)
        raise ValueError("Token expirado.")
    except InvalidTokenError as e:
        logger.error("[decodificar_token_verificacion] Token inválido", exc_info=e)
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
            logger.error("[verificar_token_modificar_email] Type inválido", exc_info=None)
            return None
        return payload
    except ExpiredSignatureError as e:
        logger.error("[verificar_token_modificar_email] Token expirado", exc_info=e)
        return None
    except InvalidTokenError as e:
        logger.error("[verificar_token_modificar_email] Token inválido", exc_info=e)
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
            logger.error("[verificar_token_eliminacion] Type inválido", exc_info=None)
            return None
        return payload
    except ExpiredSignatureError as e:
        logger.error("[verificar_token_eliminacion] Token expirado", exc_info=e)
        return None
    except InvalidTokenError as e:
        logger.error("[verificar_token_eliminacion] Token inválido", exc_info=e)
        return None