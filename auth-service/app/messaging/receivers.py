import logging
from flask import Flask
from common.decorators.receiver import receiver
from app.database.session import SessionLocal
from app.models import Usuario

@receiver(channel="crear_usuario_persona")
def crear_usuario_para_persona(message: dict, app: Flask):
    """
    Función decorada que actúa como receptor de eventos en el canal 'crear_usuario_persona'.
    Su propósito es crear un nuevo usuario cuando se recibe un evento desde el microservicio
    de personas indicando que una persona fue creada y necesita un usuario asociado.
    Args:
        message (dict): Estructura del mensaje recibido, que debe contener el tipo de evento y datos del usuario.
        app (Flask): Instancia de la aplicación Flask para usar su contexto (app_context).
    Formato esperado del mensaje:
    {
        "event_type": "persona_creada_y_necesita_usuario",
        "message": {
            "email": "persona@dominio.com",
            "nombre_usuario": "persona123"  # opcional
        }
    }
    """
    # Validar que el evento sea del tipo correcto
    if message.get("event_type") != "persona_creada_y_necesita_usuario":
        return # No es el evento esperado

    logging.info("[AuthService] Evento recibido: crear usuario desde persona")
    # Crear una sesión de base de datos
    session = SessionLocal()
    #Activar contexto de la app para operaciones dependientes del entorno Flask
    with app.app_context():
        data = message.get("message", {})
        email = data.get("email")
        nombre_usuario = data.get("nombre_usuario")  # opcional
        # Validar que el email esté presente
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