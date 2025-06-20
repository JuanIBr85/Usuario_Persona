
from datetime import timedelta
from dotenv import load_dotenv
from app.extensions import get_redis


OTP_EXPIRATION_SECONDS = 300  # 5 minutos
TOKEN_EXPIRATION_SECONDS = 600  # 10 minutos

def guardar_otp(email: str, codigo: str):
    key = f"otp:{email}"
    redis_client = get_redis()
    redis_client.setex(key, OTP_EXPIRATION_SECONDS, codigo)

def verificar_otp_redis(email: str, codigo: str) -> bool:
    key = f"otp:{email}"
    redis_client = get_redis()
    valor = redis_client.get(key)
    if valor and valor == codigo:
        #redis_client.delete(key)
        return True
    return False

def guardar_token_recuperacion(email: str, token: str):
    key = f"token_recuperacion:{token}"
    redis_client = get_redis()
    redis_client.setex(key, TOKEN_EXPIRATION_SECONDS, email)

def verificar_token_recuperacion(token: str) -> str | None:
    key = f"token_recuperacion:{token}"
    redis_client = get_redis()
    email = redis_client.get(key)
    if email:
        redis_client.delete(key)
        return email
    return None