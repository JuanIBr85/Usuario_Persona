import random
from datetime import datetime, timedelta, timezone

from flask_mail import Message
from flask import current_app
from app.extensions import mail  

def generar_codigo_otp() -> str:
    return "{:06d}".format(random.randint(0, 999999))

def enviar_codigo_por_email_persona(persona, codigo_otp: str):

    
    expiracion = datetime.now(timezone.utc) + timedelta(minutes=15)
    expiracion_str = expiracion.strftime("%Y-%m-%d %H:%M UTC")

    # mensaje que se envia en el mail
    msg = Message(
        subject="Tu código de verificación",
        recipients=[persona.contacto.email_contacto],
        body=(
            f"Hola {persona.nombre_persona} {persona.apellido_persona},\n\n"
            f"Tu código de verificación es: {codigo_otp}\n"
            f"Este código expirará el {expiracion_str}.\n\n"
            "Si no solicitaste este código, puedes ignorar este mensaje."
        )
    )

    mail.send(msg)
