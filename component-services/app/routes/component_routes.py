from flask import abort, request, g, Response, Blueprint, jsonify      
from app.extensions import limiter
from app.utils.cache_util import cache_response
from app.utils.request_to_service import request_to_service
from common.decorators.api_access import api_access
from flask_jwt_extended import jwt_required
from app.decorators.cp_api_access import cp_api_access

# Creamos un Blueprint
bp = Blueprint('component', __name__)


@bp.route('/aaa', methods=["GET"])
@cp_api_access(is_public=True, limiter=["2 per minute"])
def index2():
    return jsonify({
        "message": "Bienvenido a la API de Componentes"
        }),200