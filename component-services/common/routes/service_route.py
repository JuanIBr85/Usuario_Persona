import threading
from flask import Blueprint, current_app, jsonify, request
from common.utils.make_endpoints_list import make_endpoints_list
from common.utils.get_component_info import get_component_info
from common.decorators.receiver import get_receiver
from common.schemas.message_schema import MessageSchema
import traceback
import logging

message_schema = MessageSchema()

bp = Blueprint("service", __name__, cli_group="component")


@bp.route("/endpoints", methods=["GET"])
def service():
    """
    Retorna la lista de endpoints del servicio que poseean el decorador @api_access
    """
    return make_endpoints_list(current_app)


@bp.route("/health", methods=["GET"])
def health():
    """
    Retorna el estado de salud del servicio
    """
    return "OK", 200


@bp.route("/info", methods=["GET"])
def info():
    """
    Retorna la informacion del servicio que esta en el component-info
    """
    return get_component_info(), 200


@bp.route("/receiver", methods=["POST"])
def receiver():
    """
    Recibe un mensaje y lo envia al receiver correspondiente
    """
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
        logging.error(f"Error al recibir mensaje: {str(e)}")
        return "Error al recibir mensaje", 500


@bp.route("/debug", methods=["GET"])
def debug():
    """
    Retorna la lista completa de endpoints del servicio
    """

    output = []
    for rule in current_app.url_map.iter_rules():
        if rule.endpoint == "static":
            continue
        methods = sorted(rule.methods - {"HEAD", "OPTIONS"})
        output.append(
            {
                "endpoint": rule.endpoint,
                "methods": ", ".join(methods),
                "rule": str(rule),
            }
        )
    return jsonify(output)