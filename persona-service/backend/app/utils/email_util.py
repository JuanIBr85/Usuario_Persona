import random
from datetime import datetime, timedelta, timezone

from flask_mail import Message
from flask import current_app
from app.extensions import mail  

def generar_codigo_otp() -> str:
    return "{:06d}".format(random.randint(0, 999999))


# mail que se envia con el codigo otp para verificar la persona
"""
AJUSTAR MENSAJE 
"""
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
        ),
    )
    try:
        mail.send(msg)
    except Exception as e:
        print(f"Error al enviar el correo: {str(e)}")


# funcion auxiliar para censurar email
def censurar_email(email: str) -> str:
    local, _, domain = email.partition("@")
    if len(local) <= 2:
        censored_local = local[0] + "*" * (len(local) - 1)
    else:
        censored_local = local[0] + "*" * (len(local) - 2) + local[-1]
    return f"{censored_local}@{domain}"

# email a administrador para terminar de vincular un usuario con un perfil de persona ya existente
def enviar_notificacion_verificacion_admin(persona, datos_usuario: dict, coinciden: bool):
    admin_email = current_app.config["ADMIN_EMAIL"]

    estado = "COINCIDEN" if coinciden else "NO COINCIDEN"

    msg = Message(
        subject=f"Verificación de identidad - {estado}",
        recipients=[admin_email],
        body=(
            f"Verificación de identidad solicitada.\n\n"
            f"Persona en base de datos:\n"
            f"- Tipo documento: {persona.tipo_documento}\n"
            f"- Nro documento: {persona.num_doc_persona}\n"
            f"- Nombre: {persona.nombre_persona}\n"
            f"- Apellido: {persona.apellido_persona}\n"
            f"- Fecha nacimiento: {persona.fecha_nacimiento_persona}\n"
            f"- Teléfono: {persona.contacto.telefono_movil}\n\n"
            f"Datos proporcionados por el usuario:\n"
            f"- Nombre: {datos_usuario.get('nombre')}\n"
            f"- Apellido: {datos_usuario.get('apellido')}\n"
            f"- Fecha nacimiento: {datos_usuario.get('fecha_nacimiento')}\n"
            f"- Teléfono: {datos_usuario.get('telefono_movil')}\n\n"
            f"Resultado de verificación: {estado}\n\n"
            "Por favor, revise esta solicitud en el sistema."
        )
    )

    try:
        mail.send(msg)
    except Exception as e:
        print(f"[ERROR] al enviar email al administrador: {str(e)}")