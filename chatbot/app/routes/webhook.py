from flask import request, jsonify, Blueprint
from datetime import datetime
from app.config import token_verificacion
from app.utils.enviar import enviar
from app.utils.get_horario import get_horario
from app.utils.get_contacto_info import get_contacto_info
from app.utils.get_noticias_publicadas import get_noticias_publicadas
from app.utils.get_preguntas_frecuentes import get_preguntas_frecuentes
from app.utils.get_propuestas_activas_con_inscripcion import get_propuestas_activas_con_inscripcion
from app.extensions import MENU#, SessionLocal
from common.decorators.api_access import api_access
#from app.utils.limpiar_registros_usuarios import limpiar_registros_usuarios
#from app.models.registro import Registro
import logging

bp = Blueprint("webhook", __name__)

@bp.route("/webhook/", methods=["POST", "GET"])
@api_access(is_public=True)
def webhook_whatsapp():
    """
    Endpoint para recibir y responder mensajes de WhatsApp.
    """
    try:
        if request.method == "GET":
            # Verificación del webhook con el token
            if request.args.get('hub.verify_token') == token_verificacion:
                return request.args.get('hub.challenge')
            else:
                return "Error de autentificacion."

        data = request.get_json()
        if 'messages' not in data['entry'][0]['changes'][0]['value']:
            return jsonify({"status": "no_message"}, 200)

        mensaje_info = data['entry'][0]['changes'][0]['value']['messages'][0]
        if 'text' not in mensaje_info:
            return jsonify({"status": "no_text"}, 200)

        telefonoCliente = mensaje_info['from']
        mensaje = mensaje_info['text']['body'].lower()
        idWA = mensaje_info['id']
        timestamp = mensaje_info['timestamp']

        import re

        if re.search(r'\b2\b', mensaje):
            respuesta = get_propuestas_activas_con_inscripcion()
        elif re.search(r'\b3\b', mensaje):
            respuesta = get_contacto_info()
        elif re.search(r'\b(hol+a+|hol[ai]+|buen[oa]s?|buenos días|buenas tardes|buenas noches|hey|hello|hi|qué tal|que tal|qué onda|que onda|como estas|como andas|saludos|que hay)\b', mensaje):
            respuesta = ("¡Hola! 👋🏻 Bienvenido/a al asistente virtual de CREUS.\n\n ¿En qué podemos ayudarte hoy? Estas son las opciones disponibles:\n\n" + MENU)
        elif re.search(r'\b1\b', mensaje):
            respuesta = get_horario()
        elif re.search(r'\b4\b', mensaje):
            respuesta = get_noticias_publicadas()
        elif re.search(r'\b5\b', mensaje):
            respuesta = get_preguntas_frecuentes()
        else:
            respuesta = (
                "No te entendí 🤔. Por favor, elegí una de las siguientes opciones:\n\n" +
                MENU
            )

        # Verificar si el mensaje ya existe y guardar si es nuevo
        # db = SessionLocal()
        # try:
        #     # Verificar si ya existe un registro con este id_wa
        #     existe = db.query(Registro).filter(Registro.id_wa == idWA).first()
            
        #     # Si el mensaje es nuevo, lo registra en la base de datos
        #     if not existe:
        #         nuevo_registro = Registro(
        #             mensaje_recibido=mensaje[:1000],
        #             mensaje_enviado=respuesta[:1000],
        #             id_wa=idWA,
        #             timestamp_wa=timestamp,
        #             telefono_wa=telefonoCliente,
        #             fecha_hora=datetime.utcnow()
        #         )
        #         db.add(nuevo_registro)
        #         db.commit()
        #         limpiar_registros_usuarios()
        # finally:
        #     db.close()
            
        enviar(telefonoCliente, respuesta)
        return jsonify({"status": "success"}, 200)

    except Exception as e:
        # Guarda el error en un archivo de texto para debugging
        logging.error("Error al procesar el webhook: %s", str(e))
        return jsonify({"status": "error", "message": str(e)}, 500)