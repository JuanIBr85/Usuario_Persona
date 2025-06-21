from flask import Blueprint, current_app
from common.utils.make_endpoints_list import make_endpoints_list
from common.utils.get_component_info import get_component_info

bp = Blueprint("service", __name__, cli_group="component")


@bp.route("/endpoints", methods=["GET"])
def service():
    return make_endpoints_list(current_app)


@bp.route("/health", methods=["GET"])
def health():
    return "OK", 200


@bp.route("/info", methods=["GET"])
def info():
    return get_component_info(), 200
