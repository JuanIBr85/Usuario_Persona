import os
from dotenv import load_dotenv

# carga las variables de entorno desde .env
load_dotenv()

# CONFIGURACIONES GENERALES

# CONFIGURACIONES BASE DE DATOS

# user= os.environ['MYSQL_USER']
# password= os.environ['MYSQL_PASSWORD']
# host= os.environ['MYSQL_HOST']
# database= os.environ['MYSQL_DATABASE']

SQLALCHEMY_DATABASE_URI = os.environ.get("SQLALCHEMY_DATABASE_URI")
SQLALCHEMY_TRACK_MODIFICATIONS = False

# CONFIGURACIONES JWT

JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY")

SERVICES_CONFIG_FILE = os.environ.get("SERVICES_CONFIG_FILE")
