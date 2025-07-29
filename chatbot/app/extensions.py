from heyoo import WhatsApp
from app.config import token, idNumeroTelefono
# from sqlalchemy import create_engine
# from sqlalchemy.orm import sessionmaker, scoped_session, declarative_base
# from app.config import SQLALCHEMY_DATABASE_URI

# Inicializa el objeto de WhatsApp
mensajeWa = WhatsApp(token, idNumeroTelefono)

# engine = create_engine(
#     SQLALCHEMY_DATABASE_URI, echo=False, echo_pool=False, future=True
# )
# Base = declarative_base()
# SessionLocal = scoped_session(
#     sessionmaker(autocommit=False, autoflush=False, bind=engine)
# )

MENU = (
    "1️⃣ *Horario de atención* 🕙\n"
    "2️⃣ *Carreras activas* 🎓\n"
    "3️⃣ *Información de contacto* 📇\n"
    "4️⃣ *Últimas noticias* 📰\n"
    "5️⃣ *Preguntas frecuentes* ❓\n\n"
    "Por favor, respondé con el número de la opción que te interese.\n"
)