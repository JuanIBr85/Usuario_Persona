import os
from dotenv import load_dotenv

#carga las variables de entorno desde .env
load_dotenv()

#CONFIGURACIONES GENERALES

#CONFIGURACIONES BASE DE DATOS

#user= os.environ['MYSQL_USER']
#password= os.environ['MYSQL_PASSWORD']
#host= os.environ['MYSQL_HOST']
#database= os.environ['MYSQL_DATABASE']

SQLALCHEMY_DATABASE_URI = os.environ.get('SQLALCHEMY_DATABASE_URI') or 'sqlite:///components.db'
SQLALCHEMY_TRACK_MODIFICATIONS = False

#CONFIGURACIONES JWT

SERVICES_CONFIG_FILE=os.environ.get('SERVICES_CONFIG_FILE') or 'app/config/services-dev.json'
JWT_ALGORITHM = 'RS256'
JWT_PUBLIC_KEY = open('./secrets/public_key.pem', 'r').read()
