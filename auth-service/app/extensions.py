from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_mail import Mail
import redis
import os
from dotenv import load_dotenv

"""
Módulo de inicialización de extensiones globales.

Este archivo define e inicializa las extensiones utilizadas en la aplicación,
como el sistema de rate limiting (`Flask-Limiter`), envío de correos (`Flask-Mail`),
y la conexión perezosa a Redis.

Incluye:
- `limiter`: Middleware de rate limit por dirección IP.
- `mail`: Cliente de correo Flask.
- `get_redis()`: Inicializador perezoso de conexión a Redis.

Notas:
- La conexión a Redis se realiza solo la primera vez que se llama `get_redis()`.
- Las variables de entorno `REDIS_HOST` y `REDIS_PORT` son utilizadas para la configuración.
"""

limiter = Limiter(key_func=get_remote_address)
mail = Mail()

# lazy connection a redis. se llama solo cuando se usa.
_redis_client = None

def get_redis():
    global _redis_client
    if _redis_client is None:
        try:
            _redis_client = redis.StrictRedis(
                host=os.getenv("REDIS_HOST", "localhost"), 
                port=int(os.getenv("REDIS_PORT", 6379)),
                db=0,
                decode_responses=True
            )
            _redis_client.ping()  # test de conexión
            print("[✓] Redis conectado correctamente.")
        except Exception as e:
            print("[x] Error al conectar con Redis:", e)
            raise
    return _redis_client

get_redis()