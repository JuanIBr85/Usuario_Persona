import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from app.models.base_model import Base

# Ruta absoluta del directorio raíz del proyecto (por ejemplo /app dentro del contenedor)
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
DB_DIR = os.path.join(BASE_DIR, "auth_data")
DB_PATH = os.path.join(DB_DIR, "auth.db")

# Asegurar que el directorio exista
os.makedirs(DB_DIR, exist_ok=True)

# Crear el engine con la ruta nueva
DATABASE_URL = f"sqlite:///{DB_PATH}"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))

# Exponer DB_PATH para otros scripts (como reset_db.py)
__all__ = ["Base", "engine", "SessionLocal", "DB_PATH"]
