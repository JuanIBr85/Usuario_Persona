from common.services.service_request import ServiceRequest
from common.utils.ttl_cache_util import TTLCacheUtil
from app.models.service_model import ServiceModel
from app.schemas.service_schema import ServiceSchema
from app.services.servicio_base import ServicioBase
import uuid


services_service: ServicioBase = ServicioBase(ServiceModel, ServiceSchema())
# Cache para los servicios 10s
cache_ttl = TTLCacheUtil(maxsize=300, ttl=10)


class MessageService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MessageService, cls).__new__(cls)
        return cls._instance

    def send_message(
        self, to_service: str, channel: str = "default", message: dict = {}
    ):
        # Si el servicio no esta cacheado lo buscamos en la base de datos
        service = cache_ttl.get_or_cache(to_service, lambda: services_service.query(
            lambda session: session.filter_by(service_name=to_service).first(),
            not_dump=True,
        ))

        # Si el servicio no existe
        if service is None:
            return None, 404, "Servicio no encontrado"

        # Si el servicio no esta disponible
        if not service.service_available:
            return None, 400, "Servicio no disponible"
        try:
            # Enviamos el mensaje
            response = ServiceRequest.post(
                f"{service.service_url}/component_service/receiver",
                json=message,
            )
            if response.status_code != 200:
                return None, response.status_code, "Error al enviar mensaje"
        except Exception as e:
            return None, 500, str(e)

        return response.text, response.status_code, None

    def make_message(
        self,
        to_service: str,
        event_type: str,
        message: dict = {},
        channel: str = "default",
    ):
        return {
            "from_service": "component-service",
            "to_service": to_service,
            "channel": channel,
            "event_type": event_type,
            "message": message,
            "message_id": uuid.uuid4().hex,
        }
