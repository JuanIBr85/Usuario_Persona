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




def generar_token_dispositivo(email, user_agent, ip):
    payload = {
        "email": email,
        "user_agent": user_agent,
        "ip": ip,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=30)
    }
    return jwt.encode(payload, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')


def enviar_email_validacion_dispositivo(usuario, user_agent, ip):
    token = generar_token_dispositivo(usuario.email_usuario, user_agent, ip)
    enlace = f"{current_app.config['DEVICE_VERIFICATION_URL']}?token={token}"

    msg = Message(
        subject="Nuevo dispositivo detectado",
        recipients=[usuario.email_usuario],
        body=(
            f"Hola {usuario.nombre_usuario},\n\n"
            f"Detectamos un inicio de sesión desde un nuevo dispositivo.\n\n"
            f"Para confirmar que fuiste vos, hacé clic en el siguiente enlace:\n\n{enlace}\n\n"
            f"Este enlace expirará en 30 minutos."
        )
    )
    mail.send(msg)