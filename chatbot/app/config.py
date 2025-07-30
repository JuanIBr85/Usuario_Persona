from dotenv import load_dotenv
import os

load_dotenv()

# Configuración desde variables de entorno
BASE_API_URL = os.getenv("BASE_API_URL")
CREUS_BASE_URL = os.getenv("CREUS_BASE_URL")
token = os.getenv("WA_TOKEN")
idNumeroTelefono = os.getenv("WA_PHONE_ID")
token_verificacion = os.getenv("VERIFY_TOKEN")
WEBHOOK_SECRET=os.getenv("WEBHOOK_SECRET")
DB_HOST=os.getenv("DB_HOST")
DB_USER=os.getenv("DB_USER")
DB_PASSWORD=os.getenv("DB_PASSWORD")
DB_NAME=os.getenv('DB_NAME')
DB_PORT=os.getenv("DB_PORT")

SQLALCHEMY_DATABASE_URI = f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
