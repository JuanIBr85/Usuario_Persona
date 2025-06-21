from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session, declarative_base
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from config import SQLALCHEMY_DATABASE_URI, SERVICES_CONFIG_FILE
from diskcache import FanoutCache
import json

import os

engine = create_engine(SQLALCHEMY_DATABASE_URI, echo=True, future=True)
Base = declarative_base()
SessionLocal = scoped_session(
    sessionmaker(autocommit=False, autoflush=False, bind=engine)
)

jwt = JWTManager()

services_config = []  # json.load(open(SERVICES_CONFIG_FILE))

limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])

cache = FanoutCache(
    "cache-db",
    shards=4,  # Número de shards para mejor concurrencia
    timeout=1,  # Timeout para operaciones
)

# Inicializar la base de datos
import app.database
