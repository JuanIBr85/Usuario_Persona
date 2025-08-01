from app.config import BASE_API_URL
from app.services.request_service import request_service

def get_contacto_info():
    """
    Consulta la información de contacto desde la API.
    """
    url = f"{BASE_API_URL}/api/cms/contacto/"
    try:
        r = request_service(url)
        if r:
            contacto = r["data"]
            respuesta = (
                "📞 *Datos de contacto CREUS*\n\n"
                f"🏫 Dirección: {contacto.get('direccion', '')}, {contacto.get('localidad', '')}, {contacto.get('provincia', '')}\n\n"
                f"📮 Código Postal: {contacto.get('codigo_postal', '')}\n\n"
                f"☎️ Teléfono: {contacto.get('telefono', '')}\n\n"
                f"💬 WhatsApp: {contacto.get('whatsapp', '')}\n\n"
                f"✉️ Email: {contacto.get('email', '')}\n\n"
                f"📸 Instagram: {contacto.get('instagram', '')}\n\n"
                f"📘 Facebook: {contacto.get('facebook', '')}\n\n"
            )
            return respuesta[:4096]
        else:
            return "⚠️ No se pudo obtener los datos de contacto."
    except Exception as e:
        return f"❌ Error al consultar datos de contacto: {str(e)}"
