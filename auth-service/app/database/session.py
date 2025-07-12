import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from app.models.base_model import Base
from dotenv import load_dotenv

# Carga las variables de entorno definidas en un archivo .env
load_dotenv()  

# Variables de configuración para la conexión a la base de datos
DB_USER = os.getenv("POSTGRES_USER")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD")
DB_NAME = os.getenv("POSTGRES_DB")
DB_HOST = os.getenv("POSTGRES_HOST")
DB_PORT = os.getenv("POSTGRES_PORT")

# Construcción de la URL de conexión con el motor PostgreSQL usando psycopg2
DATABASE_URL = f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Se crea el motor de conexión a la base de datos
engine = create_engine(DATABASE_URL)
# Se crea una sesión local para manejar las transacciones
# Se usa scoped_session para manejar el contexto de la sesión de manera segura en aplicaciones multihilo
# autocommit=False y autoflush=False para controlar el comportamiento de las transacciones
SessionLocal = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))

# Exponer DB_PATH para otros scripts (como reset_db.py)
__all__ = ["Base", "engine", "SessionLocal"]
 