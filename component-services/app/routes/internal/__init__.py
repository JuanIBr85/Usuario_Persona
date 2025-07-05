from flask import Blueprint
from app.routes.internal.message import bp as message_bp
from app.routes.internal.services import bp as services_bp

bp = Blueprint("internal", __name__, cli_group="internal")

# Estas son rutas que solo utilizan los microservicios

bp.register_blueprint(message_bp)
bp.register_blueprint(services_bp)
