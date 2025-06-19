import os
import urllib.parse
from dotenv import find_dotenv, load_dotenv


# Cargar primero el archivo con datos sensibles (si existe)
dotenv_path = ".env"
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)
    print("Variables cargadas desde .env")

# Cargar variables por defecto desde .env.example (sin sobrescribir las ya cargadas)
load_dotenv(".env.example", override=False)
print("Variables cargadas desde .env.example (solo las faltantes)")

# CONFIGURACIONES GENERALES

# CONFIGURACIONES BASE DE DATOS

user = os.environ["MYSQL_USER"]
password = os.environ["MYSQL_PASSWORD"]
host = os.environ["MYSQL_HOST"]
database = os.environ["MYSQL_DATABASE"]
port = os.environ.get("MYSQL_PORT", "3306")

password_enc = urllib.parse.quote(password)

# port = os.environ.get("MYSQL_PORT", "3306")
SQLALCHEMY_DATABASE_URI = (
    f"mysql+pymysql://{user}:{password_enc}@{host}:{port}/{database}"
)

# cambiar las dos lineas de arriba por la de abajo para levantar mysql con docker. no olvidar configurar .env antes.
# SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{user}:{password_enc}@{host}/{database}"


SQLALCHEMY_TRACK_MODIFICATIONS = False


# CONFIGURACIONES JWT

JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY")

# LISTAS REDES Y TIPOS DOCUMENTOS

TIPOS_DOCUMENTO_VALIDOS = os.environ.get("TIPOS_DOCUMENTO_VALIDOS", "").split(",")
REDES_SOCIALES_VALIDAS = os.environ.get("REDES_SOCIALES_VALIDAS", "").split(",")
ESTADO_CIVIL = os.environ.get("ESTADO_CIVIL", "").split(",")
OCUPACION = os.environ.get("OCUPACION", "").split(",")
ESTUDIOS_ALCANZADOS = os.environ.get("ESTUDIOS_ALCANZADOS", "").split(",")

print("TIPOS_DOCUMENTO_VALIDOS:", TIPOS_DOCUMENTO_VALIDOS)
print("REDES_SOCIALES_VALIDAS:", REDES_SOCIALES_VALIDAS)
print("ESTADO_CIVIL:", ESTADO_CIVIL)
print("OCUPACION:", OCUPACION)
print("ESTUDIOS_ALCANZADOS:", ESTUDIOS_ALCANZADOS)
