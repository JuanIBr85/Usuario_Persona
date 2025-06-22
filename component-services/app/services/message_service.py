import requests
from cachetools import TTLCache
from app.models.service_model import ServiceModel
from app.schemas.service_schema import ServiceSchema
from app.services.servicio_base import ServicioBase

services_service: ServicioBase = ServicioBase(ServiceModel, ServiceSchema())

# Cache para los servicios 10s
cache_ttl = TTLCache(maxsize=300, ttl=10)


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
        if to_service in cache_ttl:
            service = cache_ttl[to_service]
        else:
            service = services_service.query(
                lambda session: session.filter_by(service_name=to_service).first(),
                not_dump=True,
            )
            cache_ttl[to_service] = service

        # Si el servicio no existe
        if service is None:
            return None, 404, "Servicio no encontrado"

        # Si el servicio no esta disponible
        if not service.service_available:
            return None, 400, "Servicio no disponible"

        # Enviamos el mensaje
        response = requests.post(
            f"{service.service_url}/component_service/receiver",
            json=message,
            timeout=2,
        )
        if response.status_code != 200:
            return None, response.status_code, "Error al enviar mensaje"

        return response.text, response.status_code, None
