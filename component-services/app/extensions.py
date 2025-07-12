from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session, declarative_base
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from config import SQLALCHEMY_DATABASE_URI, SERVICES_CONFIG_FILE, REDIS_HOST, REDIS_PORT
#from diskcache import FanoutCache
import logging
import redis
import os
from limits.storage import RedisStorage

engine = create_engine(
    SQLALCHEMY_DATABASE_URI, echo=False, echo_pool=False, future=True
)
Base = declarative_base()
SessionLocal = scoped_session(
    sessionmaker(autocommit=False, autoflush=False, bind=engine)
)

# Inicializar la base de datos
import app.database


jwt = JWTManager()

services_config = []  # json.load(open(SERVICES_CONFIG_FILE))

limiter = Limiter(
    key_func=get_remote_address, 
    default_limits=["100/minute"],
    # REDIS DB 2 CACHE
    storage_uri=f"redis://{REDIS_HOST}:{REDIS_PORT}/2",
    enabled=True#Para desactivar durante los berchmarks
)

# Este es el cache de los endpoints
#cache = FanoutCache(
#    "cache-db",
#    shards=4,  # Número de shards para mejor concurrencia
#    timeout=1,  # Timeout para operaciones
#    size_limit=2**30,  # Limita el tamaño de la cache 1GB
#)


# Configuracion de redis
redis_client_auth = None # Aca se almacenan los tokens
redis_client_core = None # Es para intercambiar mensajes para sincronizar los workers
redis_client_cache = None # Este es para manejar cualquier dato de cache
try:
    redis_client_auth = redis.StrictRedis(
        host=REDIS_HOST,
        port=REDIS_PORT,
        db=0,
        decode_responses=True,
    )
    redis_client_auth.ping()  # test de conexión
    print("[✓] Redis auth conectado correctamente.")

    redis_client_core = redis.StrictRedis(
        host=REDIS_HOST,
        port=REDIS_PORT,
        db=1,
        decode_responses=True,
    )
    redis_client_core.ping()  # test de conexión
    
    print("[✓] Redis core conectado correctamente.")

    redis_client_cache = redis.StrictRedis(
        host=REDIS_HOST,
        port=REDIS_PORT,
        db=2,
        decode_responses=False,
    )
    redis_client_cache.ping()  # test de conexión
    print("[✓] Redis cache conectado correctamente.")
except Exception as e:
    print("[x] Error al conectar con Redis:", e)
    raise e




# IDENTIFICADOR UNICO DEL WORKER GUNICORN
WORKER_ID = f"COMPONENT-SERVICE-ID-{os.getpid()}"
