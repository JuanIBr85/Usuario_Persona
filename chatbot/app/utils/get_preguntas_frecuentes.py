from app.config import BASE_API_URL
from app.services.request_service import request_service

def get_preguntas_frecuentes():
    """
    Consulta las preguntas frecuentes desde la API.
    """
    url = f"{BASE_API_URL}/api/creus/api/cms/preguntas-frecuentes/"
    try:
        r = request_service(url)
        if r:
            data = r.get("data", [])
            if not data:
                return "❓ No hay preguntas frecuentes disponibles en este momento."
            respuesta = "❓ *Preguntas frecuentes:*\n\n"
            for pf in data:
                pregunta = pf.get("pregunta", "Sin pregunta")
                respuesta_pf = pf.get("respuesta", "Sin respuesta")
                respuesta += f"• *{pregunta}*\n{respuesta_pf}\n\n"
                if len(respuesta) > 4000:
                    respuesta += "...\n(Límite de preguntas alcanzado)"
                    break
            return respuesta[:4096]
        else:
            return "⚠️ No se pudo obtener las preguntas frecuentes."
    except Exception as e:
        return f"❌ Error al consultar preguntas frecuentes: {str(e)}"
