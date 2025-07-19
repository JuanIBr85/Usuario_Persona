from common.routes.service_route import bp
import logging
from common.decorators.receiver import exist_receiver, receiver
from common.utils.response import make_response, ResponseStatus
from flask import request

codigos_redireccion = [300, 301, 302, 303, 304, 305, 306, 307, 308]

def component_service(app, warning_redirection: bool = True):
    """
        Este metodo configura el servicio como un servicio de componentes
        Añade las rutas requeridas para que componentes pueda comunicarse con el
    """

    app.register_blueprint(bp, url_prefix="/component_service")
    app.url_map.strict_slashes = False

    if not exist_receiver("default"):
        logging.error("No existe el canal default")
        receiver("default")(
            lambda message, app: logging.error(
                f"No existe el canal {message['channel']} message: {message}"
            )
        )

    if warning_redirection:
        @app.after_request
        def handle_308_redirect(response):
            #Pequeña optimizacion para evitar estar verificando la lista cada vez que se active el after_request
            if response.status_code>=300 and response.status_code<400:
                #Si el codigo esta en la lista
                if response.status_code in codigos_redireccion:
                    logging.warning(f"Se detecto un codigo {response.status_code} en la ruta {request.url_rule} metodo {request.method}")
                    return make_response(ResponseStatus.ERROR, "Redireccion no permitida por parte del servicio", error_code=f"component_debug_{response.status_code}"), 500

            return response

    logging.info("Component service registrado")
