from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os
import logging
import time

# Estos paquetes vienen del modulo common del servicio de componentes
from common.decorators.receiver import receiver
from common.utils.component_service import component_service
from common.services.send_message_service import send_message
from common.decorators.api_access import api_access
from common.services.component_service_api import ComponentServiceApi

from app.script.reset_db import crear_base, eliminar_base
from app.script.seed_data import seed
from app.routes.usuarios_blueprint import usuario_bp
from app.routes.superadmin_blueprint import superadmin_bp
from app.routes.admin_microservicios_blueprint import admin_micro_bp
from app.extensions import mail
import smtplib
from app.utils.actualizar_roles_permisos import actualizar_roles

def create_app():
    #monkey patch para no lanzar el log de mails.
    smtplib.SMTP.set_debuglevel = lambda self, level: None
    load_dotenv()
    app_flask = Flask(__name__)
    app_flask.config.from_object("config.Config")

    # inicializo extensiones
    mail.init_app(app_flask)
    JWTManager(app_flask)

    component_service(app_flask)
    # registro blueprints
    app_flask.register_blueprint(superadmin_bp, url_prefix="/super-admin")
    app_flask.register_blueprint(admin_micro_bp, url_prefix="/admin-micro")
    app_flask.register_blueprint(usuario_bp)
    from app.messaging import receivers

    import logging

    logging.basicConfig(
        level=logging.INFO,  # También podés usar DEBUG para más detalle
        format="%(asctime)s %(levelname)s: %(message)s",
    )

    if os.environ.get("WERKZEUG_RUN_MAIN") != "true":
        init_app()

    # ruta raíz
    @api_access(is_public=True)
    @app_flask.route("/")
    def index():
        print(request.headers)
        output = []
        for rule in app_flask.url_map.iter_rules():
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

    return app_flask


def init_app():
    FORZAR_RESET = True
    if FORZAR_RESET:
        print("[i] Reiniciando base de datos y datos del seed...")
        eliminar_base()
        crear_base()
        seed()

    else:
        print("[✓] Base de datos ya existente. No se reinicia.")





@receiver(channel="default")
# Este es un decorador que recibe mensajes de un canal
# el canal "default" es el canal por defecto
# esta funcion recibe un mensaje y lo procesa en un hilo separado
def funcion_que_recibe_mensajes(message: dict, app_flask: Flask) -> None:
    event_type = message.get("event_type")
    if event_type == "gateway-research" or event_type == "component-start-service":
        with app_flask.app_context():
            #Espero 5 segundos para que el servicio de componentes este completamente listo
            time.sleep(5)
            actualizar_roles()

    logging.warning("[Mensajería] Mensaje recibido:")
    logging.warning(message)
