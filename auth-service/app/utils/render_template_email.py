"""
Genera una plantilla HTML uniforme para los correos electrónicos enviados por la aplicación.

Esta función centraliza el formato visual de los correos, aplicando una estética consistente,
con fondo oscuro, texto blanco y borde redondeado.

Args:
    saludo_html (str): Contenido HTML para el saludo o encabezado del mensaje.
    cuerpo_html (str): Cuerpo principal del mensaje en formato HTML.
    extra_html (str, opcional): Sección adicional de contenido. Puede incluir botones, enlaces, etc.
    aviso_expiracion (str, opcional): Aviso en la parte inferior sobre expiración del código u otra advertencia.

Returns:
    str: Cadena con el bloque HTML completo, listo para ser enviado por correo.

"""


def render_email_template(
    saludo_html: str,
    cuerpo_html: str,
    extra_html: str = "",
    aviso_expiracion: str = "Este código expirará en 15 minutos.",
):
    # """Devuelve el bloque HTML con la misma estética en todos los mails."""
    return f"""
 <div style="
        font-family: Arial, sans-serif;
        background-color: #1C1464;
        border-radius: 10px;
        color: #FFFFFF;
        max-width: 500px;
        margin: 0 auto;
        box-sizing: border-box;
    ">
        <div style="padding: 30px;">
            {saludo_html}
            {cuerpo_html}
            {extra_html}
            <p style="font-size: 13px; margin-top: 20px; color: #cccccc;">
                {aviso_expiracion}
            </p>
        </div>
        <footer style="
            margin-top: 0;
            background-color: #3C3744;
            padding: 10px;
            border-radius: 0 0 10px 10px;
            color: #ffff;
            text-align: center;
        ">
            <p style="font-size: 12px; margin: 0; display: flex; align-items: center; justify-content: center; gap: 8px;">
                <svg fill="#ffff" style="height: 1.2em; width: auto; vertical-align: middle;" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.485,16.857l10,6c.027.016.057.023.084.036s.057.026.087.038a.892.892,0,0,0,.688,0c.03-.012.058-.024.087-.038s.057-.02.084-.036l10-6a1,1,0,0,0,.3-1.438l-10-14c-.013-.018-.035-.024-.049-.04a.962.962,0,0,0-1.53,0c-.014.016-.036.022-.049.04l-10,14a1,1,0,0,0,.3,1.438ZM13,20.234V5.121L20.557,15.7ZM11,5.121V20.234L3.443,15.7Z" />
                </svg>
                PRISMA: Plataforma de Registro de Identidades, Servicios y Módulos Asociados
            </p>
        </footer>
    </div>
    """
