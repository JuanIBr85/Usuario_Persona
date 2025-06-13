from urllib3 import request
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session, declarative_base
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from config import SQLALCHEMY_DATABASE_URI, SERVICES_CONFIG_FILE
import requests
import json

engine = create_engine(SQLALCHEMY_DATABASE_URI, echo=True, future=True)
Base = declarative_base()
SessionLocal = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))

jwt = JWTManager()

services_config = json.load(open(SERVICES_CONFIG_FILE))

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100/minute"]
)

from diskcache import Cache

cache = Cache('cache-db')