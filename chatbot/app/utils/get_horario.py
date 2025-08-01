import requests
from app.config import BASE_API_URL

def get_horario():
    """
    Consulta los horarios de atención desde la API.
    """
    url = f"{BASE_API_URL}/api/cms/horario/"
    try:
        r = requests.get(url, timeout=10)
        if r.ok:
            horarios = r.json()["data"]
            if not horarios or len(horarios) == 0:
                return "⏰ No hay horarios de atención disponibles en este momento."
            respuesta = "🕑 *Horarios de atención CREUS:*\n\n"
            for h in horarios:
                if h.get("visible", True):
                    dia = h.get("dia", "")
                    inicio = h.get("hora_inicio", "")
                    cierre = h.get("hora_cierre", "")
                    respuesta += f"• 📅 {dia}: de {inicio} a {cierre}\n"
            return respuesta
        else:
            return "⚠️ No se pudo obtener el horario de atención."
    except Exception as e:
        return f"❌ Error al consultar horario: {str(e)}"
