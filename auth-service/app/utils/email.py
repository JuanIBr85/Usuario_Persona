from flask_mail import Message
from flask import current_app
from app.extensions import mail
import jwt
from datetime import datetime, timedelta,timezone
from jwt import decode, ExpiredSignatureError, InvalidTokenError


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
    

def enviar_email_recuperacion(usuario,token):
    
    enlace = f"{current_app.config['PASSWORD_RESET_URL']}?token={token}"

    msg = Message(
        subject="Recuperación de contraseña",
        recipients=[usuario.email_usuario],
        body=f"Hola {usuario.nombre_usuario},\n\nHaz clic en el siguiente enlace para restablecer tu contraseña:\n\n{enlace}\n\nEste enlace expirará en 60 minutos."
    )
    mail.send(msg)

def generar_token_reset_password(email):
    payload = {
        "email": email,
        "sub": "reset_password",  # para distinguir propósito
        "exp":datetime.now(timezone.utc) + timedelta(minutes=60)
    }
    return jwt.encode(payload, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')


def verificar_token_reset(token):
    try:
        payload = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
        return payload['email']
    except ExpiredSignatureError:
        raise ValueError("Token expirado.")
    except InvalidTokenError:
        raise ValueError("Token inválido.")