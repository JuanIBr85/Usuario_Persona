from ast import Dict
from flask import Flask
from app.routes.example_routes import bp as example_bp
import logging

# Estos paquetes vienen del modulo common del servicio de componentes
from common.decorators.receiver import receiver
from common.utils.component_service import component_service
from common.services.send_message_service import send_message


def create_app():

    app = Flask(__name__)

    # Se registra el servicio de componentes en el servicio,
    # esto expone las rutas que requiere para que el servicio pueda ser consumido
    component_service(app)

    app.register_blueprint(example_bp, url_prefix="/example")

    return app


@receiver(channel="default")
# Este es un decorador que recibe mensajes de un canal
# el canal "default" es el canal por defecto
# esta funcion recibe un mensaje y lo procesa en un hilo separado
def funcion_que_recibe_mensajes(message: Dict) -> None:
    logging.warning(message)
    send_message(to_service="auth-service", message={"message": "hola"})
