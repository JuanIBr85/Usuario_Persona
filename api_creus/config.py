import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY") or "clave-secreta-por-defecto"

    SQLALCHEMY_DATABASE_URI = (
        os.environ.get("DATABASE_URI") or "mysql+pymysql://URL_SERVIDOR_PONER"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY") or "jwt-clave-secreta-por-defecto"
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # 1 hora


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


class TestingConfig(Config):
    TESTING = False
    SQLALCHEMY_DATABASE_URI = "sqlite:///test.db"


config = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
    "default": DevelopmentConfig,
}
