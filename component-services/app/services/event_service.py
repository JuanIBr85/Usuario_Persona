from app.services.message_service import MessageService
from app.services.services_search_service import ServicesSearchService
import uuid
import logging
from app.utils.get_health import get_health
from app.utils.lock_events import make_lock_event, acquire_lock


message_service = MessageService()

#Locks para los eventos
gateway_research_event = make_lock_event("gateway-research")
component_stop_service_event = make_lock_event("component-stop-service")
component_start_service_event = make_lock_event("component-start-service")


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
        for service in ServicesSearchService().get_services(ignore_not_live=True):
            try:
                response, status_code, error = self._send_event(
                    service.service_name,
                    event_type,
                    data,
                )

                if status_code != 200:
                    logging.warning(
                        f"Error enviando evento <{event_type}> a {service.service_name}: {error}"
                    )
            except Exception as e:
                logging.warning(
                    f"Error enviando evento <{event_type}> a {service.service_name}: {str(e)}"
                )

    def gateway_research(self, isEnd=False):
        acquire_lock(gateway_research_event, lambda: self._send_event_all("gateway-research", {"isEnd": isEnd}), "gateway-research")

    def component_stop_service(self):
        acquire_lock(component_stop_service_event, lambda: self._send_event_all("component-stop-service", {}), "component-stop-service")

    def component_start_service(self):
        acquire_lock(component_start_service_event, lambda: self._send_event_all("component-start-service", {}), "component-start-service")
