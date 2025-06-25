from flask import Flask, jsonify
from flask_cors import CORS
import os
from app.extensions import engine, Base, logger
from app.routes import register_blueprints
from app.decorators.cp_api_access import cp_api_access
from flask_jwt_extended import JWTManager
from app.extensions import limiter, jwt
from app.services.endpoints_search_service import EndpointsSearchService
from app.services.services_serch_service import ServicesSearchService
import threading
from app.utils.redis_message import redis_stream_start, register_redis_receiver

endpoints_search_service = EndpointsSearchService()
# Defino los modelos
import app.models


@cp_api_access(is_public=True)
def sys_detenido():
    return "El sistema esta detenido", 503


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

    # Registra todas las rutas
    register_blueprints(app)

    # Este endpoint es el que se usa para reemplazar todos los demas endpoints
    app.route("/sys_detenido", methods=["NONE"])(sys_detenido)

    # Inicializa el servicio de busqueda de endpoints
    # Iniciar el refresco en segundo plano
    thread = threading.Thread(target=endpoints_search_service.refresh_endpoints)
    thread.daemon = True  # El hilo se cerrará cuando el programa principal termine
    thread.start()

    # Cargo el listado de redirecciones
    thread = threading.Thread(target=ServicesSearchService().update_redirect)
    thread.daemon = True  # El hilo se cerrará cuando el programa principal termine
    thread.start()

    # Inicializa el servicio de mensajeria
    redis_stream_start(app)

    return app


# Recarga la api gateway
@register_redis_receiver("research")
def research(app: Flask, message_data: dict):
    logger.warning("Recargando endpoints")
    endpoints_search_service.refresh_endpoints()
    ServicesSearchService().update_redirect()


# Detiene todo el sistema
@register_redis_receiver("stop_services")
def stop_services(app: Flask, message_data: dict):
    logger.warning("Deteniendo servicios")
    for endpoint in app.view_functions.keys():
        # Solo permite la comunicacion entre servicios
        if endpoint == "message.send_message":
            continue
        app.view_functions[endpoint] = sys_detenido
