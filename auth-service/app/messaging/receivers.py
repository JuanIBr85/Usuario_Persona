import logging
from flask import Flask
from common.decorators.receiver import receiver
from app.database.session import SessionLocal
from app.models import Usuario

@receiver(channel="crear_usuario_persona")
def crear_usuario_para_persona(message: dict, app: Flask):

    if message.get("event_type") != "persona_creada_y_necesita_usuario":
        return

    logging.info("[AuthService] Evento recibido: crear usuario desde persona")
    session = SessionLocal()
    with app.app_context():
        data = message.get("message", {})
        email = data.get("email")
        nombre_usuario = data.get("nombre_usuario")  # opcional

        if not email:
            logging.warning("Email requerido para crear usuario")
            return

        # Evitar duplicados
        if session.query.filter_by(email_usuario=email).first():
            logging.warning(f"Ya existe un usuario con el email {email}")
            return

        nuevo_usuario = Usuario(nombre_usuario=nombre_usuario or email, email_usuario=email)
        session.add(nuevo_usuario)
        session.commit()

        logging.info(f"Usuario creado para persona con email: {email}")