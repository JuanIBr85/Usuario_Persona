from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session, declarative_base
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from config import SQLALCHEMY_DATABASE_URI, SERVICES_CONFIG_FILE
from diskcache import FanoutCache
import logging
import redis
import os

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

limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])

# Este es el cache de los endpoints
cache = FanoutCache(
    "cache-db",
    shards=4,  # Número de shards para mejor concurrencia
    timeout=1,  # Timeout para operaciones
    size_limit=2**30,  # Limita el tamaño de la cache 1GB
)

logger = logging.getLogger(__name__)

# Configuracion de redis
redis_client_auth = None # Aca se almacenan los tokens
redis_client_core = None # Es para intercambiar mensajes para sincronizar los workers
try:
    redis_client_auth = redis.StrictRedis(
        host=os.getenv("REDIS_HOST", "localhost"),
        port=int(os.getenv("REDIS_PORT", 6379)),
        db=0,
        decode_responses=True,
    )
    redis_client_auth.ping()  # test de conexión
    print("[✓] Redis auth conectado correctamente.")

    redis_client_core = redis.StrictRedis(
        host=os.getenv("REDIS_HOST", "localhost"),
        port=int(os.getenv("REDIS_PORT", 6379)),
        db=1,
        decode_responses=True,
    )
    redis_client_core.ping()  # test de conexión
    print("[✓] Redis core conectado correctamente.")
except Exception as e:
    print("[x] Error al conectar con Redis:", e)
    raise e

# IDENTIFICADOR UNICO DEL WORKER GUNICORN
WORKER_ID = f"COMPONENT-SERVICE-ID-{os.getpid()}"
