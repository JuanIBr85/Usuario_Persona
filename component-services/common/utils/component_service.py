from common.routes.service_route import bp
import logging
from common.decorators.receiver import exist_receiver, receiver

logger = logging.getLogger(__name__)


def component_service(app):

    app.register_blueprint(bp, url_prefix="/component_service")

    if not exist_receiver("default"):
        logger.error("No existe el canal default")
        receiver("default")(
            lambda message: logger.error(
                f"No existe el canal {message['channel']} message: {message}"
            )
        )

    logger.info("Component service registrado")
