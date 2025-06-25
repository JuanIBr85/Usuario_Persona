from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os
import sys

from ast import Dict
import logging


# Estos paquetes vienen del modulo common del servicio de componentes
from common.decorators.receiver import receiver
from common.utils.component_service import component_service
from common.services.send_message_service import send_message
from common.utils.component_service import component_service
from common.decorators.api_access import api_access


import requests
from app.script.reset_db import crear_base, eliminar_base
from app.script.seed_data import seed
from app.routes.usuarios_blueprint import usuario_bp
from app.routes.superadmin_blueprint import superadmin_bp
from app.routes.admin_microservicios_blueprint import admin_micro_bp
from app.extensions import mail


def create_app():
    load_dotenv()
    app_flask = Flask(__name__)
    app_flask.config.from_object("config.Config")

    # inicializo extensiones
    mail.init_app(app_flask)
    JWTManager(app_flask)
    CORS(app_flask, resources={r"/*": {"origins": "*"}}, 
         supports_credentials=True,
         allow_headers=["Content-Type","Authentication","authorization","Authorization"])
    component_service(app_flask)
    # registro blueprints
    app_flask.register_blueprint(superadmin_bp, url_prefix='/super-admin')
    app_flask.register_blueprint(admin_micro_bp, url_prefix='/admin-micro')
    app_flask.register_blueprint(usuario_bp)
    from app.messaging import receivers


    # handlers y db seeds…

    if os.environ.get("WERKZEUG_RUN_MAIN") != "true":
        init_app()

    

    # ruta raíz
    @api_access(is_public=True)
    @app_flask.route('/')
    def index():
        print(request.headers)
        output = []
        for rule in app_flask.url_map.iter_rules():
            if rule.endpoint == 'static': continue
            methods = sorted(rule.methods - {'HEAD', 'OPTIONS'})
            output.append({
                'endpoint': rule.endpoint,
                'methods': ", ".join(methods),
                'rule': str(rule)
            })
        return jsonify(output)

    return app_flask


def init_app():
    FORZAR_RESET = True
    db_path = os.path.join("auth_data", "auth.db")
    if FORZAR_RESET or not os.path.exists(db_path):
        print("[i] Reiniciando base de datos y datos iniciales...")
        eliminar_base()
        crear_base()
        seed()
    else:
        print("[✓] Base de datos ya existente. No se reinicia.")


@receiver(channel="default")
# Este es un decorador que recibe mensajes de un canal
# el canal "default" es el canal por defecto
# esta funcion recibe un mensaje y lo procesa en un hilo separado
def funcion_que_recibe_mensajes(message: Dict, app_flask: Flask) -> None:
    logging.warning(message)
    send_message(to_service="auth-service", message={"message": "hola"})