import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()  

class Config:
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "clave_por_defecto_insegura")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(seconds=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 900)))
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(seconds=int(os.getenv("JWT_REFRESH_TOKEN_EXPIRES", 86400)))
