import logging
import os
from dotenv import load_dotenv
import yaml
# carga las variables de entorno desde .env
load_dotenv()

# CONFIGURACIONES GENERALES

# CONFIGURACIONES BASE DE DATOS
 
DB_USER = os.environ.get("DB_USER", "component_user")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "component_pass")
DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_PORT = int(os.environ.get("DB_PORT", 5433))
DB_DATABASE = os.environ.get("DB_DATABASE", "component_db")

SQLALCHEMY_DATABASE_URI: str = os.environ.get("SQLALCHEMY_DATABASE_URI", "")

if SQLALCHEMY_DATABASE_URI == "":
    SQLALCHEMY_DATABASE_URI = f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_DATABASE}"

SQLALCHEMY_TRACK_MODIFICATIONS = False
SQLALCHEMY_ECHO = False
# CONFIGURACIONES JWT

JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY")

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))

SERVICES_CONFIG_FILE: str = (
    os.environ.get("SERVICES_CONFIG_FILE") or "services-dev.json"
)
logging.info("Cargando configuracion de CORS")
with open("cors.yml", "r") as f:
    CORS_CONFIG = yaml.safe_load(f)

logging.info(f"{CORS_CONFIG}")
