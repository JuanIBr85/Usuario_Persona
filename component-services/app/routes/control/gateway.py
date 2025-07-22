import threading
from flask import Blueprint
from app.decorators.cp_api_access import cp_api_access
from app.services.endpoints_search_service import EndpointsSearchService
from app.services.services_search_service import ServicesSearchService
from common.utils.response import make_response, ResponseStatus
from app.services.message_service import MessageService
import uuid
from app.utils.redis_message import send_event
from app.services.event_service import EventService

event_service: EventService = EventService()

bp = Blueprint("gateway", __name__, cli_group="control", url_prefix="/gateway")
endpoints_search_service = EndpointsSearchService()


@bp.route("/research", methods=["GET"])
@cp_api_access(is_public=False, limiter=["2 per minute"], access_permissions=["component.control.investigacion"])
def research():

    if endpoints_search_service.is_search_in_progress():
        return (
            make_response(
                ResponseStatus.SUCCESS,
                "Actualización de endpoints en progreso",
            ),
            202,
        )
    # Envio un evento de que la gateway se recarga
    event_service.gateway_research()
    # Sincronizo a los workers para que recargen sus endpoints
    send_event("research", {})

    return (
        make_response(
            ResponseStatus.SUCCESS,
            "Actualización de endpoints iniciada en segundo plano",
        ),
        202,
    )


@bp.route("/research_status", methods=["GET"])
@cp_api_access(is_public=False, limiter=["20 per minute"], access_permissions=["component.control.investigacion"])
def get_research_status():
    return (
        make_response(
            ResponseStatus.SUCCESS,
            "Estado de la busqueda de endpoints",
            {
                "search_in_progress": endpoints_search_service.is_search_in_progress(),
                "log": endpoints_search_service.get_search_log(),
            },
        ),
        200,
    )


@bp.route("/research_stop", methods=["GET"])
@cp_api_access(is_public=False, limiter=["2 per minute"], access_permissions=["component.control.investigacion"])
def stop_research():
    endpoints_search_service.stop_search()
    return make_response(ResponseStatus.SUCCESS, "Busqueda de endpoints detenida"), 200





@bp.route("/get_all_endpoints", methods=["GET"])
@cp_api_access(is_public=True)
def get_all_endpoints():
    """
    Obtiene un listado completo de los endpoints de los servicios que estan en componentes cargados
    """
    try:
        endpoints = list(map(lambda x: x.to_dict(), endpoints_search_service.get_services_route().values()))
        return make_response(ResponseStatus.SUCCESS, "Endpoints obtenidos correctamente", endpoints), 200
    except Exception as e:
        return make_response(ResponseStatus.ERROR, "Error obteniendo endpoints", e.__class__.__name__), 500
        