from common.utils.get_component_info import get_component_info
import uuid
import requests
import traceback
from common.schemas.message_schema import MessageSchema
import os
import logging
message_schema = MessageSchema()
logger = logging.getLogger(__name__)
COMPONENT_SERVICE_HOST = os.environ.get("COMPONENT_SERVICE_HOST", "localhost")  # Default to auth-service if not set
logger.error(COMPONENT_SERVICE_HOST)
def send_message(
    to_service: str, channel: str = "default", event_type: str = "default", message: dict = {}
):
    try:
        # Obtenemos el nombre del servicio desde el header
        from_service = get_component_info()["service"]["service_name"]

        message = {
            "from_service": from_service,
            "to_service": to_service,
            "channel": channel,
            "event_type": event_type,
            "message": message,
            "message_id": uuid.uuid4().hex,  # Generamos un id unico para el mensaje
        }

        error = message_schema.validate(message)

        if error:
            return None, 400, error


        
        logger.error(
            f"Enviando mensaje a {to_service} en el canal {channel}: {message}"
        )

        # Enviamos el mensaje
        response = requests.post(
            f"http://{COMPONENT_SERVICE_HOST}:5002/internal/send",
            json=message,
            timeout=2,
        )
        if response.status_code != 200:
            return (
                None,
                response.status_code,
                response.text or "Error al enviar mensaje",
            )

        return message["message_id"], response.status_code, None
    except Exception as e:
        traceback.print_exc()
        return None, 500, str(e)
