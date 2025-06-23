import threading
from flask import Blueprint, current_app, request
from common.utils.make_endpoints_list import make_endpoints_list
from common.utils.get_component_info import get_component_info
from common.decorators.receiver import get_receiver
from common.schemas.message_schema import MessageSchema
import traceback
import logging

logger = logging.getLogger(__name__)
message_schema = MessageSchema()

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


@bp.route("/receiver", methods=["POST"])
def receiver():
    try:
        data = request.get_json()

        error = message_schema.validate(data)

        if error:
            return "formato invalido", 400

        receiver_func = get_receiver(data["channel"])

        if not receiver_func:
            return "Error no existe el canal", 404

        threading.Thread(
            target=receiver_func,
            args=(
                data,
                current_app._get_current_object(),
            ),
        ).start()

        return "OK", 200
    except Exception as e:
        traceback.print_exc()
        logger.error(f"Error al recibir mensaje: {str(e)}")
        return "Error al recibir mensaje", 500
