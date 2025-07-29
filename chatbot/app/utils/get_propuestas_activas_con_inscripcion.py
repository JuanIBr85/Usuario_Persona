from app.config import BASE_API_URL
from app.services.request_service import request_service

def get_propuestas_activas_con_inscripcion():
    """
    Consulta las carreras/propuestas activas con inscripción desde la API.
    """
    url = f"{BASE_API_URL}/api/creus/api/propuestas/activas-con-inscripciones"
    try:
        r = request_service(url)
        if r:
            propuestas = r["data"]
            if not propuestas:
                return "📚 No hay carreras con inscripciones abiertas en este momento."
            respuesta = "🎓 *Carreras con inscripción abierta:*\n\n"
            for p in propuestas:
                nombre = p.get("nombre", "Sin nombre")
                tipo = p.get("tipo_propuesta", {}).get("nombre", "")
                if p.get("cohortes_disponibles"):
                    cohorte = p["cohortes_disponibles"][0]
                    fecha_inicio_cursado = cohorte.get("fecha_inicio_cursado", "")[:10]
                    fecha_inicio_preinsc = cohorte.get("fecha_inicio_preinscripcion", "")[:10]
                    fecha_cierre_preinsc = cohorte.get("fecha_cierre_preinscripcion", "")[:10]
                    fecha_fin_estimada = cohorte.get("fecha_estimada_finalizacion", "")[:10]
                    respuesta += (
                        f"✅ {nombre} ({tipo})\n"
                        f"• 🗓️ Inicio cursado: {fecha_inicio_cursado}\n"
                        f"• 📥 Inicio preinscripción: {fecha_inicio_preinsc}\n"
                        f"• ⏰ Cierre preinscripción: {fecha_cierre_preinsc}\n"
                        f"• 🎯 Fin estimada: {fecha_fin_estimada}\n\n"
                    )
                else:
                    respuesta += f"✅ {nombre} ({tipo})\n• Sin fechas de cohorte informadas\n\n"
            return respuesta[:4096]
        else:
            return "⚠️ No se pudo obtener la lista de carreras con inscripción abierta."
    except Exception as e:
        return f"❌ Error al consultar carreras: {str(e)}"
