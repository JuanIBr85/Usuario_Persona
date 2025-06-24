import os
from dotenv import load_dotenv

# carga las variables de entorno desde .env
load_dotenv()

# CONFIGURACIONES GENERALES

# CONFIGURACIONES BASE DE DATOS

DB_USER = os.environ.get("DB_USER", "componentes_user")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "componentes_pass")
DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_PORT = int(os.environ.get("DB_PORT", 5432))
DB_DATABASE = os.environ.get("DB_DATABASE", "componentes_db")

SQLALCHEMY_DATABASE_URI: str = os.environ.get("SQLALCHEMY_DATABASE_URI", "")

if SQLALCHEMY_DATABASE_URI == "":
    SQLALCHEMY_DATABASE_URI = f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_DATABASE}"

SQLALCHEMY_TRACK_MODIFICATIONS = False
SQLALCHEMY_ECHO = False
# CONFIGURACIONES JWT

JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY")

SERVICES_CONFIG_FILE: str = (
    os.environ.get("SERVICES_CONFIG_FILE") or "services-dev.json"
)
