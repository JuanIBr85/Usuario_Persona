
from datetime import timedelta
from dotenv import load_dotenv
import json
from app.extensions import get_redis

DATOS_REGISTRO_EXPIRATION_SECONDS=21600 # 6 horitas
OTP_EXPIRATION_SECONDS = 1500  # 15 minutos
TOKEN_EXPIRATION_SECONDS = 1800  # 30 minutos
MAX_INTENTOS_FALLIDOS = 3  # máximo de intentos permitidos


def guardar_otp(email: str, codigo: str):
    key = f"otp:{email.strip().lower()}"
    redis_client = get_redis()
    redis_client.setex(key, OTP_EXPIRATION_SECONDS, codigo)

def verificar_otp_redis(email: str, codigo: str) -> bool:
    key = f"otp:{email.strip().lower()}"
    redis_client = get_redis()
    valor = redis_client.get(key)
    if valor and valor == codigo:
        redis_client.delete(key)
        return True
    return False
'''def verificar_otp_redis(email: str, codigo: str) -> dict:
    key = f"otp:{email}"
    key_intentos = f"otp_intentos:{email}"
    redis_client = get_redis()

    valor = redis_client.get(key)
    if valor is None:
        # OTP no existe o expiró
        return {"estado": "expirado"}
    # Redis devuelve bytes, decodificamos si es necesario

    valor = valor.decode() if isinstance(valor, bytes) else valor
    valor = str(valor).strip()
    codigo = str(codigo).strip()

    print(f"[DEBUG] OTP Redis: '{valor}' vs Ingresado: '{codigo}'")

    if valor == codigo:
        # otp correcto, se borra todo con .delete
        redis_client.delete(key)
        redis_client.delete(key_intentos)
        return {"estado": "valido"}
    else:
        # si se erra el codigo incrementamos en 1 con .incr(si la key no existe la crea con valor 1)
        intentos = redis_client.incr(key_intentos)
        # Si es el primer intento, obtenemos el tiempo restante que le queda al otp
        # ttl="time to live"->funcionalidad de redis que recupera el tiempo exacto en segundos que le quedan a una key
        if intentos == 1:
            ttl = redis_client.ttl(key)
            if ttl > 0:
                # Asignamos el ttl al contador de intentos
                redis_client.expire(key_intentos, ttl)

        intentos_restantes = MAX_INTENTOS_FALLIDOS - intentos

        if intentos >= MAX_INTENTOS_FALLIDOS:
            # Superó la cantidad de intentos, borramos OTP y contador
            redis_client.delete(key)
            redis_client.delete(key_intentos)
            return {"estado": "bloqueado", "intentos_restantes": 0}
            
        return {
                "estado": "invalido",
                "intentos_restantes": max(0, intentos_restantes)
            }'''


# =====================
#   Registro temporal
# =====================

def guardar_datos_registro_temporal(email: str, datos: dict):
    key = f"registro_temp:{email}"
    redis_client = get_redis()
    redis_client.setex(key, DATOS_REGISTRO_EXPIRATION_SECONDS, json.dumps(datos))

def obtener_datos_registro_temporal(email: str) -> dict | None:
    key = f"registro_temp:{email}"
    redis_client = get_redis()
    valor = redis_client.get(key)
    if valor:
        try:
            return json.loads(valor)
        except Exception as e:
            print(f"Error decodificando datos temporales: {e}")
    return None

# =========================
#   Recuperación por token
# =========================
def guardar_token_recuperacion(email: str, token: str):
    key = f"token_recuperacion:{token}"
    redis_client = get_redis()
    redis_client.setex(key, TOKEN_EXPIRATION_SECONDS, email)

def verificar_token_recuperacion(token: str) -> str | None:
    key = f"token_recuperacion:{token}"
    redis_client = get_redis()
    email = redis_client.get(key)
    email = email.decode() if isinstance(email, bytes) else email
    if email:
        #redis_client.delete(key)
        return email
    return None