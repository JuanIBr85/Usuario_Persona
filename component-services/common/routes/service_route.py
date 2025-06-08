from flask import Blueprint, current_app
from common.utils.make_endpoints_list import make_endpoints_list

bp = Blueprint("service", __name__)

@bp.route("/service", methods=["GET"])
def service():
    return make_endpoints_list(current_app)
