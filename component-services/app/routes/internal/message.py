import threading
import traceback
from flask import Blueprint
from flask import request
from app.decorators.cp_api_access import cp_api_access
from common.utils.response import make_response, ResponseStatus
import logging
from app.services.message_service import MessageService
from common.schemas.message_schema import MessageSchema

message_schema = MessageSchema()

bp = Blueprint("message", __name__, cli_group="internal", url_prefix="/message")


@bp.route("/send", methods=["POST"])
def send_message():
    try:
        errors = message_schema.validate(request.get_json())

        if errors:
            return make_response(ResponseStatus.FAIL, errors), 400

        message_service = MessageService()
        data = request.get_json()

        response, status_code, error = message_service.send_message(
            data["to_service"], data["channel"], data
        )

        if error:
            return make_response(ResponseStatus.FAIL, error), status_code

        return (
            make_response(
                ResponseStatus.SUCCESS, "Mensaje enviado correctamente", response
            ),
            status_code,
        )
    except Exception as e:
        traceback.print_exc()
        logging.error(f"Error al enviar mensaje: {str(e)}")
        return make_response(ResponseStatus.ERROR, str(e)), 500
