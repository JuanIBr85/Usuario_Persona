from flask import Flask, jsonify
from flask_cors import CORS
import os
from app.extensions import engine, Base
from app.routes import register_blueprints
from app.decorators.cp_api_access import cp_api_access
from flask_jwt_extended import JWTManager
from app.extensions import limiter, jwt
from app.services.endpoints_search_service import EndpointsSearchService
from app.services.services_search_service import ServicesSearchService
import threading
from app.utils.redis_message import redis_stream_start, register_redis_receiver
from app.services.event_service import EventService
from config import CORS_CONFIG
import logging
endpoints_search_service = EndpointsSearchService()
# Defino los modelos
import app.models
from werkzeug.middleware.proxy_fix import ProxyFix



@cp_api_access(is_public=True)
def sys_detenido():
    return "El sistema esta detenido", 503


def create_app() -> Flask:

    app = Flask(__name__)

    app.config.from_object("config")

    CORS(
        app,
        **CORS_CONFIG
    )

    limiter.init_app(app)

    # Configura ProxyFix para que confíe en 1 proxy
    app.wsgi_app = ProxyFix(
        app.wsgi_app,
        x_for=1,      # X-Forwarded-For
        x_proto=1,    # X-Forwarded-Proto
        x_host=1,     # X-Forwarded-Host
        x_prefix=1    # X-Forwarded-Prefix
)


    # Inicializa de las exteniciones
    jwt.init_app(app)
    with app.app_context():
        Base.metadata.create_all(bind=engine)

    # Registra todas las rutas
    register_blueprints(app)

    # Este endpoint es el que se usa para reemplazar todos los demas endpoints
    app.route("/sys_detenido", methods=["NONE"])(sys_detenido)

    # Inicializa el servicio de busqueda de endpoints
    endpoints_search_service.refresh_endpoints()

    # Cargo el listado de redirecciones
    ServicesSearchService().update_redirect()

    # Inicializa el servicio de mensajeria
    redis_stream_start(app)

    #Se desactivo este evento por alguna razon provoca un retrazo
    # Aviso a los servicios que inicio el servicio de componentes
    EventService().component_start_service()

    return app


# Recarga la api gateway
@register_redis_receiver("research")
def research(app: Flask, message_data: dict):
    logging.info("Recargando endpoints")
    endpoints_search_service.refresh_endpoints()
    ServicesSearchService().update_redirect()


# Detiene todo el sistema
@register_redis_receiver("stop_services")
def stop_services(app: Flask, message_data: dict):
    logging.warning("Deteniendo servicios")
    for endpoint in app.view_functions.keys():
        # Solo permite la comunicacion entre servicios
        if endpoint == "message.send_message":
            continue
        app.view_functions[endpoint] = sys_detenido
