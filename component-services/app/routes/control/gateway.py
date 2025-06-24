import threading
from flask import Blueprint
from app.decorators.cp_api_access import cp_api_access
from app.services.endpoints_search_service import EndpointsSearchService
from app.services.services_serch_service import ServicesSearchService
from common.utils.response import make_response, ResponseStatus
from app.services.message_service import MessageService
import uuid
from app.utils.redis_message import send_event

bp = Blueprint("gateway", __name__, cli_group="control", url_prefix="/gateway")
endpoints_search_service = EndpointsSearchService()


@bp.route("/research", methods=["GET"])
@cp_api_access(is_public=True, limiter=["5 per minute"])
def research():

    if endpoints_search_service.is_search_in_progress():
        return (
            make_response(
                ResponseStatus.SUCCESS,
                "Actualización de endpoints en progreso",
            ),
            202,
        )

    send_event("research", {})

    message_service = MessageService()
    for service in ServicesSearchService().get_services():

        data = {
            "from_service": "component-service",
            "to_service": service.service_name,
            "channel": "default",
            "event_type": "gateway-research",
            "message": {
                "message": "Actualización de endpoints iniciada en segundo plano"
            },
            "message_id": uuid.uuid4().hex,
        }

        status = message_service.send_message(
            data["to_service"],
            message=data,
        )

    return (
        make_response(
            ResponseStatus.SUCCESS,
            "Actualización de endpoints iniciada en segundo plano",
        ),
        202,
    )


@bp.route("/research_status", methods=["GET"])
@cp_api_access(is_public=True, limiter=["2 per minute"])
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


@bp.route("/reserch_stop", methods=["GET"])
@cp_api_access(is_public=True, limiter=["2 per minute"])
def stop_research():
    endpoints_search_service.stop_search()
    return make_response(ResponseStatus.SUCCESS, "Busqueda de endpoints detenida"), 200
