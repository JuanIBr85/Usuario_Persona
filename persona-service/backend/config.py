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

SQLALCHEMY_DATABASE_URI = f"sqlite:///database.db"#'mysql+pymysql://{user}:{password}@{host}/{database}'
SQLALCHEMY_TRACK_MODIFICATIONS = False


#CONFIGURACIONES JWT

JWT_SECRET_KEY="74ac975df0174d655b5c9e2290a286c6d7f54a1a5f9d3a8763c36100c9c669bb"

"""
secret_key= os.environ['JWT_SECRET_KEY']

"""
#CONFIGURACIONES MAIL



#CONFIGURACIONES 2FA
