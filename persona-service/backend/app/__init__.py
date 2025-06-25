import logging
from flask import Flask, jsonify
from flask_cors import CORS
import os
from app.extensions import jwt, engine, Base, mail
from app.models.persona_model import Persona
from app.models.contacto_model import Contacto
from app.models.domicilio_model import Domicilio
from app.models.domicilio_postal_model import DomicilioPostal
from app.utils.carga_domicilio_postal import cargar_domicilios_postales_csv
from common.utils.component_service import component_service
from common.decorators.receiver import receiver


def create_app():

    app = Flask(__name__)

    app.config.from_object("config")

    CORS(app, supports_credentials=True)

    # Inicializa de las exteniciones
    jwt.init_app(app)
    mail.init_app(app)
    component_service(app)

    # Registro de blueprints
    from app.routes.persona_routes import persona_bp
    from app.routes.opciones_routes import opciones_bp

    app.register_blueprint(persona_bp, url_prefix="/api")
    app.register_blueprint(opciones_bp, url_prefix="/api")

    # Crear tablas si no existen

    with app.app_context():
        Base.metadata.create_all(bind=engine)

        from app.extensions import SessionLocal

        session = SessionLocal()

        if session.query(DomicilioPostal).count() == 0:
            base_dir = os.path.abspath(os.path.dirname(__file__))
            csv_path = os.path.join(base_dir, "seeds", "domicilio_postal_ba2.csv")

            if os.path.exists(csv_path):
                cargar_domicilios_postales_csv(csv_path)
            else:
                print(f"Archivo CSV no encontrado: {csv_path}")

        session.close()

    @app.route("/")
    def index():
        output = []
        for rule in app.url_map.iter_rules():
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

    return app


"""
Mesaje recibido desde auth
{'from_service': 'auth-service', 'to_service': 'persona-service', 'channel': 'default', 'event_type': 'auth_user_register', 'message': {'id_usuario': 4, 'email': 'supesradmin@admin.com'}, 'message_id': '69ba74dccf14477c9fe634cf51e06089'}
"""


@receiver(channel="default")
# Este es un decorador que recibe mensajes de un canal
# el canal "default" es el canal por defecto
# esta funcion recibe un mensaje y lo procesa en un hilo separado
def funcion_que_recibe_mensajes(message, app_flask: Flask) -> None:
    logging.warning("[Mensajería] Mensaje recibido:")
    logging.warning(message)
