from flask import abort, request, g, Response, Blueprint
from app.extensions import limiter
from app.utils.cache_util import cache_response
from app.utils.request_to_service import request_to_service
from common.utils.response import ResponseStatus, make_response



# Creamos un Blueprint
bp = Blueprint("gateway", __name__, cli_group="gateway")


# Esto toma todo lo que entre por service por cualquier metodo
@bp.route("/<path:subpath>", methods=["GET", "POST", "PUT", "DELETE"])
@limiter.limit(
    # Reglas de limite
    limit_value=lambda: g.service_route.limiter,
    # Una clave unica que identifica el cliente
    key_func=lambda: f"{request.remote_addr}:{g.matched_endpoint}",
    # Excepcion cuando no hay limite
    exempt_when=lambda: g.service_route.limiter is None,
)
def api_gateway(subpath) -> Response:
    if request.method == "OPTIONS":
        return Response(204)

    endpoint = g.service_route

    # Si tiene argumentos, los agrego a la url
    args = ""
    if len(g.args) > 0:
        args = "/".join([str(x) for x in g.args.values()])
        args = f"/{args}"
    url = f"{endpoint.api_url}{args}"

    # Si el endpoint usa cache, lo guardo en cache
    try:
        if endpoint.cache:
            response = cache_response(lambda: request_to_service(url), url, endpoint)
            
            # Header de cache para el navegador, para que cachee la respuesta tambien
            cache_ttl = endpoint.cache["expiration"] or 10
            response["headers"]["Cache-Control"] = f"private, max-age={cache_ttl}"
        else:
            response = request_to_service(url)
    except Exception as e:
        import logging
        logging.error(f"Error al enviar la request al microservicio: {e}, url: {url}, headers: {request.headers}, params: {request.args}, data: {request.get_data()}")
        return make_response(ResponseStatus.ERROR, "Ah ocurrido un error al intentar redirigir la peticion al microservicio"), 500
    # Devolver la respuesta completa con headers, contenido y status code
    return Response(**response)
