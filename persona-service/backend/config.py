import os
import urllib.parse
from dotenv import find_dotenv, load_dotenv
import yaml

# Cargo el yml con los datos estaticos
datos_estaticos_path = os.path.join(os.path.dirname(__file__), "datos-estaticos.yml")
with open(datos_estaticos_path, "r", encoding="utf-8") as file:    
    DATOS_ESTATICOS = yaml.safe_load(file)

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

# Dias de restriccion
DIAS_RESTRICCION_MODIFICACION = int(os.getenv("RESTRICCION_MODIFICACION_DIAS", 30))


# LISTAS REDES Y TIPOS DOCUMENTOS
TIPOS_DOCUMENTO_VALIDOS = DATOS_ESTATICOS.get("documentos") or []
REDES_SOCIALES_VALIDAS = DATOS_ESTATICOS.get("redes_sociales") or []
ESTADO_CIVIL = DATOS_ESTATICOS.get("estado_civil") or []
OCUPACION = DATOS_ESTATICOS.get("ocupacion") or []
ESTUDIOS_ALCANZADOS = DATOS_ESTATICOS.get("estudios_alcanzados") or []

print("TIPOS_DOCUMENTO_VALIDOS:", TIPOS_DOCUMENTO_VALIDOS)
print("REDES_SOCIALES_VALIDAS:", REDES_SOCIALES_VALIDAS)
print("ESTADO_CIVIL:", ESTADO_CIVIL)
print("OCUPACION:", OCUPACION)
print("ESTUDIOS_ALCANZADOS:", ESTUDIOS_ALCANZADOS)


MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")
MAIL_PORT = int(os.getenv("MAIL_PORT", 587))
MAIL_USE_TLS = os.getenv("MAIL_USE_TLS", "True") == "True"
MAIL_USE_SSL = os.getenv("MAIL_USE_SSL", "False") == "True"
MAIL_USERNAME = os.getenv("MAIL_USERNAME")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
MAIL_DEFAULT_SENDER = os.getenv("MAIL_DEFAULT_SENDER")
