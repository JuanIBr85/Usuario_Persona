from flask import Blueprint, request, jsonify
from common.services.send_message_service import send_message
from common.decorators.api_access import api_access
import logging
logger = logging.getLogger(__name__)
debug_bp = Blueprint("debug", __name__, url_prefix="/debug")

from flask_jwt_extended import decode_token, exceptions

@debug_bp.route("/test_event", methods=["POST"])
@api_access(is_public=True)
def test_creus_event():
    data = request.get_json()
    id_usuario = data.get("id_usuario")
    token = data.get("token")

    if not id_usuario or not token:
        return jsonify({"error": "Faltan id_usuario o token_jwt"}), 400

    try:
        decoded = decode_token(token)
        logger.warning(f"Token válido: {decoded}")
    except Exception as e:
        logger.error(f"Token inválido en la ruta test_event: {e}")
        return jsonify({"error": "Token inválido o expirado"}), 400

    send_message(
        to_service="auth_service",
        message={
            "id_usuario": id_usuario,
            "token": token
        },
        event_type="creus_give_user_rol"
    )
    return jsonify({"status": "Evento simulado enviado correctamente"}), 200
