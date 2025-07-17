import random
from datetime import datetime, timedelta, timezone
from app.utils.render_template_email import render_email_template

from flask_mail import Message
from flask import current_app
from app.extensions import mail  

def generar_codigo_otp() -> str:
    return "{:06d}".format(random.randint(0, 999999))


# mail que se envia con el codigo otp para verificar la persona
def enviar_codigo_por_email_persona(persona, codigo_otp: str):
    saludo = f"""
        <p style="font-size:16px;display:inline-flex;align-items:center;gap:8px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" 
                class="bi bi-envelope-fill" viewBox="0 0 16 16">
                <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414.05 3.555z"/>
                <path d="M0 4.697v7.104l5.803-3.803L0 4.697zM6.761 8.83 0 13.803A2 2 0 0 0 2 14h12a2 
                        2 0 0 0 2-0.197L9.239 8.83 8 9.586 6.761 8.83zM16 4.697l-5.803 
                        3.301L16 11.801V4.697z"/>
            </svg>
            Hola <strong>{persona.nombre_persona} {persona.apellido_persona}</strong>,
        </p>
    """
    
    cuerpo = f"""
        <p style="font-size:15px;margin-top:10px;">
            Tu código de verificación es:
        </p>
        <p style="font-size:26px;font-weight:bold;letter-spacing:2px;
                  text-align:center;margin:30px 0;">
            {codigo_otp}
        </p>
    """
    advertencia = """
        <p style="font-size:13px; margin-top:20px;">
            Este código es personal y confidencial. No lo compartas con nadie.
            Si no fuiste vos quien lo solicitó, ignorá este mensaje.
        </p>
    """

    html = render_email_template(
        saludo_html=saludo,
        cuerpo_html=cuerpo,
        extra_html=advertencia,
        aviso_expiracion="Este código expirará en 15 minutos."
    )

    msg = Message(
        subject="Tu código de verificación",
        recipients=[persona.contacto.email_contacto],
        html=html
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
    admin_email = current_app.config.get("ADMIN_EMAIL", "admin@example.com")
    estado = "COINCIDEN" if coinciden else "NO COINCIDEN"
    usuario_email = datos_usuario["usuario_email"]

    saludo = f"""
        <p style="font-size:16px;">
            Verificación de identidad - <strong>{estado}</strong>
        </p>
        <p>
            El usuario <strong>{datos_usuario['nombre_persona']} {datos_usuario['apellido_persona']}</strong> 
            está solicitando verificar su perfil.
        </p>
    """

    cuerpo = f"""

        <p><strong>Datos registrados en la base de datos:</strong></p>
        <ul>
            <li>Tipo documento: {persona.tipo_documento}</li>
            <li>Nro documento: {persona.num_doc_persona}</li>
            <li>Nombre: {persona.nombre_persona}</li>
            <li>Apellido: {persona.apellido_persona}</li>
            <li>Fecha nacimiento: {persona.fecha_nacimiento_persona}</li>
            <li>Teléfono: {persona.contacto.telefono_movil}</li>
        </ul>

        <p><strong>Datos ingresados por el usuario:</strong></p>
        <ul>
            <li>Tipo documento: {datos_usuario['tipo_documento']}</li>
            <li>Nro documento: {datos_usuario['num_doc_persona']}</li>
            <li>Nombre: {datos_usuario['nombre_persona']}</li>
            <li>Apellido: {datos_usuario['apellido_persona']}</li>
            <li>Fecha nacimiento: {datos_usuario['fecha_nacimiento_persona']}</li>
            <li>Teléfono: {datos_usuario['telefono_movil']}</li>
            <li>Email del usuario: {usuario_email}</li>
        </ul>

        <p><strong>Resultado de verificación:</strong> {estado}</p>
        <p>Por favor, revise esta solicitud en el sistema.</p>
    """

    html = render_email_template(
        saludo_html=saludo,
        cuerpo_html=cuerpo,
        aviso_expiracion="Este mensaje es solo informativo."
    )

    msg = Message(
        subject=f"Verificación de identidad - {estado}",
        recipients=[admin_email],
        html=html
    )

    try:
        mail.send(msg)
    except Exception as e:
        print(f"[ERROR] al enviar email al administrador: {str(e)}")
