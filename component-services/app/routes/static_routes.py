from flask import request, Response, Blueprint, stream_with_context, jsonify
import requests
from app.extensions import services_config
import mimetypes
from app.services.endpoints_search_service import EndpointsSearchService
from app.decorators.cp_api_access import cp_api_access

bp = Blueprint("routes2", __name__, cli_group="routes2")


@bp.route("/endpoints", methods=["GET"])
def api_gateway():
    endpoints_search_service = EndpointsSearchService()
    output = {}
    for endpoint in endpoints_search_service.get_services_route():
        output.update(
            {
                endpoint: endpoints_search_service.get_services_route()[
                    endpoint
                ].to_dict()
            }
        )
    return jsonify(output)
