from flask_mail import Message
from flask import current_app, url_for
from app.extensions import mail
import jwt
from datetime import datetime, timedelta

def enviar_email_verificacion(usuario):
    token = generar_token_verificacion(usuario.email_usuario)
    enlace = f"{current_app.config['EMAIL_VERIFICATION_URL']}?token={token}"

    msg = Message(
        subject="Verifica tu correo electrónico",
        recipients=[usuario.email_usuario],
        body=f"Hola {usuario.nombre_usuario},\n\nPor favor verifica tu email haciendo clic en el siguiente enlace:\n\n{enlace}\n\nEste enlace expirará en 30 minutos."
    )
    mail.send(msg)

def generar_token_verificacion(email):
    payload = {
        "email": email,
        "exp": datetime.utcnow() + timedelta(minutes=30)
    }
    return jwt.encode(payload, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')
