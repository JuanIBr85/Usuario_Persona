from flask import Blueprint, jsonify
from app.services.endpoints_search_service import EndpointsSearchService

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
