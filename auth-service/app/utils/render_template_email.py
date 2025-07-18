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
def render_email_template(saludo_html: str,
                           cuerpo_html: str,
                           extra_html: str = "",
                           aviso_expiracion: str = "Este código expirará en 15 minutos."):
    # """Devuelve el bloque HTML con la misma estética en todos los mails."""
    return f"""
    <div style="
        font-family: Arial, sans-serif;
        background-color: #1C1464;
        padding: 30px;
        border-radius: 10px;
        color: #FFFFFF;">
        
        {saludo_html}

        {cuerpo_html}

        {extra_html}

        <p style="font-size: 13px; margin-top: 20px; color: #cccccc;">
            {aviso_expiracion}
        </p>
    </div>
    """