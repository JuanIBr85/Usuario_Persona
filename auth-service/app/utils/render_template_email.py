
def render_email_template(saludo_html: str,
                           cuerpo_html: str,
                           extra_html: str = "",
                           aviso_expiracion: str = "Este código expirará en 15 minutos. Despues de pasadas las 12 horas debera registrarse nuevamente"):
    # """Devuelve el bloque HTML con la misma estética en todos los mails."""
    return f"""
    <div style="
        font-family: Arial, sans-serif;
        background-color: #1C1464;
        padding: 30px;
        border-radius: 10px;
        color: white;">
        
        {saludo_html}

        {cuerpo_html}

        {extra_html}

        <p style="font-size: 13px; margin-top: 20px; color: #cccccc;">
            {aviso_expiracion}
        </p>
    </div>
    """