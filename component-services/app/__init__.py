from flask import Flask, jsonify
from flask_cors import CORS
import os
from app.extensions import engine, Base
from app.routes import register_blueprints
from app.decorators.cp_api_access import cp_api_access
from flask_jwt_extended import JWTManager
from common.utils.component_service import component_service
from app.extensions import limiter, jwt
from app.services.endpoints_search_service import EndpointsSearchService


def create_app() -> Flask:

    app = Flask(__name__)

    app.config.from_object("config")

    CORS(
        app,
        resources={r"/*": {"origins": "*"}},
        supports_credentials=True,
        allow_headers=[
            "Content-Type",
            "Authentication",
            "Authorization",
            "authorization",
        ],
    )

    limiter.init_app(app)

    # Inicializa de las exteniciones
    jwt.init_app(app)
    with app.app_context():
        Base.metadata.create_all(bind=engine)

    @app.route("/")
    @cp_api_access(is_public=False)
    def index():
        return jsonify({"message": "Bienvenido a la API de Componentes"}), 200

    # Registra todas las rutas
    register_blueprints(app)

    # Inicializa el servicio de busqueda de endpoints
    EndpointsSearchService().refresh_endpoints()

    return app
