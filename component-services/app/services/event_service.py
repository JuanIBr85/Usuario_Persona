from app.services.message_service import MessageService
from app.services.services_search_service import ServicesSearchService
from app.extensions import logger
import uuid
import logging

message_service = MessageService()


class EventService:
    _instance = None

    def __new__(cls):
        # Implementación del patrón Singleton
        if cls._instance is None:
            cls._instance = super(EventService, cls).__new__(cls)
        return cls._instance

    def _send_event(self, to_service: str, event_type: str, data: dict = {}):
        message = message_service.make_message(
            to_service,
            event_type,
            data,
        )

        return message_service.send_message(
            to_service,
            message=message,
        )

    def _send_event_all(self, event_type: str, data: dict = {}):
        for service in ServicesSearchService().get_services():
            response, status_code, error = self._send_event(
                service.service_name,
                event_type,
                data,
            )

            if status_code != 200:
                logger.warning(
                    f"Error enviando evento <{event_type}> a {service.service_name}: {error}"
                )

    def gateway_research(self, isEnd=False):
        self._send_event_all("gateway-research", {"isEnd": isEnd})

    def component_stop_service(self):
        self._send_event_all("component-stop-service", {})

    def component_start_service(self):
        self._send_event_all("component-start-service", {})
