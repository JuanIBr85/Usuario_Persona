import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()  


# ===================
# Debugging
# ===================
print("TEST MAIL_SERVER env var:", os.getenv("MAIL_SERVER"))
print("TEST MAIL_USERNAME env var:", os.getenv("MAIL_USERNAME"))
# ===================
# ===================

class Config:
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "clave_por_defecto_insegura")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(seconds=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 900)))
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(seconds=int(os.getenv("JWT_REFRESH_TOKEN_EXPIRES", 86400)))

    MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT = int(os.getenv("MAIL_PORT", 587))
    MAIL_USE_TLS = os.getenv("MAIL_USE_TLS", "True") == "True"
    MAIL_USE_SSL = os.getenv("MAIL_USE_SSL", "False") == "True"
    MAIL_USERNAME = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
    MAIL_DEFAULT_SENDER = os.getenv("MAIL_DEFAULT_SENDER")
    EMAIL_VERIFICATION_URL = os.getenv("EMAIL_VERIFICATION_URL")
    PASSWORD_RESET_URL = os.getenv("PASSWORD_RESET_URL")