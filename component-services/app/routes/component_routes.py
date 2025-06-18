# Creamos un Blueprint
from flask import Blueprint
from app.routes.control.gateway import bp as gateway_bp
from app.routes.control.services import bp as services_bp

bp = Blueprint("component", __name__, cli_group="control")

bp.register_blueprint(gateway_bp)
bp.register_blueprint(services_bp)