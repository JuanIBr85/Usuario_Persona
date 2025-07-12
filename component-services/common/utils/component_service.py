from common.routes.service_route import bp
import logging
from common.decorators.receiver import exist_receiver, receiver


def component_service(app):

    app.register_blueprint(bp, url_prefix="/component_service")

    if not exist_receiver("default"):
        logging.error("No existe el canal default")
        receiver("default")(
            lambda message, app: logging.error(
                f"No existe el canal {message['channel']} message: {message}"
            )
        )

    logging.info("Component service registrado")
