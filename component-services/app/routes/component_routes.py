import threading
from flask import abort, request, g, Response, Blueprint, jsonify
from app.extensions import limiter
from app.utils.cache_util import cache_response
from app.utils.request_to_service import request_to_service
from common.decorators.api_access import api_access
from flask_jwt_extended import jwt_required
from app.decorators.cp_api_access import cp_api_access
from app.services.endpoints_search_service import EndpointsSearchService
from common.utils.response import make_response, ResponseStatus

endpoints_search_service = EndpointsSearchService()

# Creamos un Blueprint
bp = Blueprint("component", __name__, cli_group="control")


@bp.route("/research", methods=["GET"])
@cp_api_access(is_public=True, limiter=["2 per minute"])
def research():
    # Iniciar el refresco en segundo plano
    thread = threading.Thread(target=EndpointsSearchService().refresh_endpoints)
    thread.daemon = True  # El hilo se cerrará cuando el programa principal termine
    thread.start()

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
                "search_in_progress": endpoints_search_service._search_in_progress,
            },
        ),
        200,
    )
