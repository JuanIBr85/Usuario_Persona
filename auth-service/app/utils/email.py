from flask_mail import Message
from flask import current_app
from app.extensions import mail
import jwt
from datetime import datetime, timedelta,timezone
from jwt import decode, ExpiredSignatureError, InvalidTokenError
import random

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
        "exp": datetime.now(timezone.utc) + timedelta(minutes=30)
    }
    return jwt.encode(payload, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')

def decodificar_token_verificacion(token: str) -> dict:
    try:
        return decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
    except ExpiredSignatureError:
        raise ValueError("Token expirado.")
    except InvalidTokenError:
        raise ValueError("Token inválido.")
    
    


def generar_codigo_otp():
    return "{:06d}".format(random.randint(0, 999999))

def enviar_codigo_por_email(usuario, codigo_otp):
    msg = Message(
        subject="Código para recuperación de contraseña",
        recipients=[usuario.email_usuario],
        body=f"Hola {usuario.nombre_usuario},\n\nTu código para recuperar tu contraseña es: {codigo_otp}\n\nEste código expirará en 15 minutos."
    )
    mail.send(msg)