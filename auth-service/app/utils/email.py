from flask_mail import Message
from flask import current_app
from app.extensions import mail
import jwt
from datetime import datetime, timedelta,timezone
from jwt import decode, ExpiredSignatureError, InvalidTokenError
from app.utils.render_template_email import render_email_template
from app.utils.jwt import generar_token_restauracion
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
    saludo = f"""
        <p style="font-size: 16px; display:inline-flex; align-items:center; gap:8px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-envelope-paper" viewBox="0 0 16 16">
  <path d="M4 0a2 2 0 0 0-2 2v1.133l-.941.502A2 2 0 0 0 0 5.4V14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5.4a2 2 0 0 0-1.059-1.765L14 3.133V2a2 2 0 0 0-2-2zm10 4.267.47.25A1 1 0 0 1 15 5.4v.817l-1 .6zm-1 3.15-3.75 2.25L8 8.917l-1.25.75L3 7.417V2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1zm-11-.6-1-.6V5.4a1 1 0 0 1 .53-.882L2 4.267zm13 .566v5.734l-4.778-2.867zm-.035 6.88A1 1 0 0 1 14 15H2a1 1 0 0 1-.965-.738L8 10.083zM1 13.116V7.383l4.778 2.867L1 13.117Z"/>
</svg>
            Hola <strong>{usuario.nombre_usuario}</strong>,
        </p>
    """
    cuerpo = """
        <p style="font-size:15px;margin-top:10px;">
            Recibiste este correo porque solicitaste restablecer tu contraseña.
        </p>
        <p style="font-size:26px;font-weight:bold;letter-spacing:2px;
                  text-align:center;margin:30px 0;">
            {codigo}
        </p>
    """.format(codigo=codigo_otp)

    html = render_email_template(saludo, cuerpo)

    msg = Message(
        subject="Código para recuperación de contraseña",
        recipients=[usuario.email_usuario],
        html=html,
    )
    mail.send(msg)
    
def enviar_codigo_por_email_registro(email: str, codigo_otp: str):
    saludo = f"""
        <p style="font-size:16px;display:inline-flex;align-items:center;gap:8px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-envelope-paper" viewBox="0 0 16 16">
  <path d="M4 0a2 2 0 0 0-2 2v1.133l-.941.502A2 2 0 0 0 0 5.4V14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5.4a2 2 0 0 0-1.059-1.765L14 3.133V2a2 2 0 0 0-2-2zm10 4.267.47.25A1 1 0 0 1 15 5.4v.817l-1 .6zm-1 3.15-3.75 2.25L8 8.917l-1.25.75L3 7.417V2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1zm-11-.6-1-.6V5.4a1 1 0 0 1 .53-.882L2 4.267zm13 .566v5.734l-4.778-2.867zm-.035 6.88A1 1 0 0 1 14 15H2a1 1 0 0 1-.965-.738L8 10.083zM1 13.116V7.383l4.778 2.867L1 13.117Z"/>
</svg>
            ¡Bienvenido!
        </p>
    """
    cuerpo = """
        <p style="font-size:15px;margin-top:10px;">
            Para terminar tu registro, ingresá el siguiente código en la aplicación:
        </p>
        <p style="font-size:26px;font-weight:bold;letter-spacing:2px;
                  text-align:center;margin:30px 0;">
            {codigo}
        </p>
    """.format(codigo=codigo_otp)
    extra = """<p style="font-size: 13px; margin-top: 20px; color: #cccccc;">
            Pasadas las 6 horas debera registrarse de nuevo.
        </p>"""
    html = render_email_template(saludo, cuerpo, extra)

    msg = Message(
        subject="Código para validar e-mail",
        recipients=[email],
        html=html,
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
    token   = generar_token_dispositivo(usuario.email_usuario, user_agent, ip)
    enlace  = f"{current_app.config['DEVICE_VERIFICATION_URL']}?token={token}"

    # ───────── 1) Bloques HTML específicos ─────────
    saludo = f"""
        <p style="font-size:16px;display:inline-flex;align-items:center;gap:8px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-envelope-paper" viewBox="0 0 16 16">
             <path d="M4 0a2 2 0 0 0-2 2v1.133l-.941.502A2 2 0 0 0 0 5.4V14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5.4a2 2 0 0 0-1.059-1.765L14 3.133V2a2 2 0 0 0-2-2zm10 4.267.47.25A1 1 0 0 1 15 5.4v.817l-1 .6zm-1 3.15-3.75 2.25L8 8.917l-1.25.75L3 7.417V2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1zm-11-.6-1-.6V5.4a1 1 0 0 1 .53-.882L2 4.267zm13 .566v5.734l-4.778-2.867zm-.035 6.88A1 1 0 0 1 14 15H2a1 1 0 0 1-.965-.738L8 10.083zM1 13.116V7.383l4.778 2.867L1 13.117Z"/>
            </svg> 
            Hola <strong>{usuario.nombre_usuario}</strong>,
        </p>
    """

    cuerpo = """
        <p style="font-size:15px;margin-top:10px;">
            Detectamos un inicio de sesión desde un <strong>nuevo dispositivo</strong>.
        </p>
        <p style="font-size:15px;margin-top:10px;">
            Para confirmar que fuiste vos, hacé clic en el siguiente botón:
        </p>
    """

    extra = f"""
        <p style="margin-top:20px;text-align:center;">
            <a href="{enlace}" style="
                background-color:white;
                color:black;
                padding:12px 24px;
                text-decoration:none;
                border-radius:5px;
                font-weight:bold;
                display:inline-flex;
                align-items:center;
                gap:8px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                 style="vertical-align: middle;" viewBox="0 0 16 16">
                 <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z"/>
                </svg>
                Confirmar dispositivo
            </a>
        </p>

        <p style="font-size:14px;margin-top:30px;">
            Si el botón no funciona, copiá y pegá este enlace en tu navegador:
        </p>
        <p style="font-size:14px;word-break:break-all;">
            <a href="{enlace}" style="color:#80bfff;text-decoration:underline;">{enlace}</a>
        </p>
    """

    # ───────── 2) Render final ─────────
    html = render_email_template(
        saludo_html=saludo,
        cuerpo_html=cuerpo,
        extra_html=extra,
        aviso_expiracion="Este enlace expirará en 30 minutos."
    )

    # ───────── 3) Enviar mensaje ─────────
    msg = Message(
        subject="Nuevo dispositivo detectado",
        recipients=[usuario.email_usuario],
        html=html,
    )
    mail.send(msg)
    

def enviar_solicitud_restauracion_admin(usuario):
    token = generar_token_restauracion(usuario.email_usuario)
    enlace = f"{current_app.config['USER_RESTORE_URL']}?token={token}"

    saludo = f"""
        <p style="font-size:16px;">Solicitud de restauración de cuenta</p>
    """
    cuerpo = f"""
        <p>El usuario <strong>{usuario.email_usuario}</strong> intentó registrarse nuevamente.</p>
        <p>Para restaurar la cuenta, hacé clic en el siguiente botón:</p>
    """
    extra = f"""
        <p style="margin-top:20px;text-align:center;">
            <a href="{enlace}" style="background-color:white; color:black; padding:12px 24px;
            text-decoration:none; border-radius:5px; font-weight:bold;">Restaurar cuenta</a>
        </p>
    """

    html = render_email_template(saludo, cuerpo, extra, "Este enlace expirará en 30 minutos.")
    
    msg = Message(
        subject="Solicitud de restauración de usuario",
        recipients=["superadmin@admin.com"], #[current_app.config['superadmin@admin.com']],
        html=html,
    )
    mail.send(msg)


def enviar_mail_confirmacion_usuario(usuario, enlace):
    saludo = f"<p>Hola <strong>{usuario.nombre_usuario}</strong>,</p>"
    cuerpo = """
        <p>Recibimos una solicitud para restaurar tu cuenta.</p>
        <p>Si fuiste vos, confirmá haciendo clic en el botón:</p>
    """
    extra = f"""
        <p style="margin-top:20px;text-align:center;">
            <a href="{enlace}" style="background-color:white;color:black;padding:12px 24px;
            text-decoration:none; border-radius:5px;font-weight:bold;">Confirmar restauración</a>
        </p>
    """

    html = render_email_template(saludo, cuerpo, extra)

    msg = Message(
        subject="Confirmar restauración de cuenta",
        recipients=[usuario.email_usuario],
        html=html,
    )
    mail.send(msg)