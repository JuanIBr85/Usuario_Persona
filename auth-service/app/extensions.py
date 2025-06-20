from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_mail import Mail
import redis
import os
from dotenv import load_dotenv

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