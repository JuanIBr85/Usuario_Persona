from app.config import BASE_API_URL, CREUS_BASE_URL
from app.services.request_service import request_service

def get_noticias_publicadas():
    """
    Consulta las últimas noticias publicadas desde la API.
    """
    url = f"{BASE_API_URL}/api/cms/noticias/publicadas?page=1&per_page=5&sort_by=fecha_publicacion&sort_order=desc"
    try:
        r = request_service(url)
        if r:
            data = r.get("data", {})
            items = data.get("items", [])
            if not items:
                return "📰 No hay noticias publicadas en este momento."
            respuesta = "📰 *Últimas noticias publicadas:*\n\n"
            for n in items:
                titulo = n.get("titulo", "Sin título")
                fecha = n.get("fecha_publicacion", "")
                contenido = n.get("contenido", "")
                noticia_id = n.get("id", "")
                link = f"{CREUS_BASE_URL}noticia/{noticia_id}" if noticia_id else ""
                contenido_resumido = (contenido[:160] + "...") if len(contenido) > 160 else contenido
                respuesta += (
                    f"• *{titulo}* ({fecha})\n"
                    f"{contenido_resumido}\n"
                    f"🔗 {link}\n\n"
                )
            return respuesta[:4096]
        else:
            return "⚠️ No se pudo obtener la lista de noticias."
    except Exception as e:
        return f"❌ Error al consultar noticias: {str(e)}"
