from flask import abort, request, g, current_app
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required
from app.services.endpoints_search_service import EndpointsSearchService
from common.models.endpoint_route_model import EndpointRouteModel
import logging

logger = logging.getLogger(__name__)
endpoints_search_service = EndpointsSearchService()


def authenticate_config(app):
    @app.before_request
    @jwt_required(optional=True)
    def authenticate_request():
        if request.method == "OPTIONS":
            return

        # Probablemente ya no sea necesario
        if not request.path.startswith("/api") or request.endpoint is None:
            abort(404, description=f"El endpoint <{request.path}> no existe")

        if request.endpoint.startswith("gateway."):
            service_route = core_endpoints()
        else:
            service_route = component_endpoints()

        # Guardo el endpoint en el contexto
        g.service_route = service_route

        # Verifico si el usuario tiene un token
        identity = get_jwt_identity()
        payload = None

        # Si tiene el token, lo guardo en el contexto
        if identity:
            payload = get_jwt()
            g.jwt = payload

        # Si no tiene el token y no es publico, aborto con 401
        if not service_route.is_public:
            # Si no tiene token se rechaza el acceso
            if not identity or payload is None:
                abort(
                    401,
                    description=f"El endpoint <{request.path}> requiere autenticación",
                )

            # Si no tiene los permisos necesario para acceder al endpoint se rechaza el acceso
            if not service_route.access_permissions.issubset(
                payload.get("permisos", [])
            ):
                abort(
                    403,
                    description=f"Acceso denegado: se requieren permisos {service_route.access_permissions}",
                )


# Funcion que obtiene el endpoint del diccionario de servicios del core
def core_endpoints() -> EndpointRouteModel:
    try:
        # Obtengo el endpoint del diccionario
        service_route, args, matched_endpoint = (
            endpoints_search_service.get_route() or (None, None, None)
        )

        if service_route is None:
            abort(404, description=f"El endpoint <{request.path}> no existe")

        # Guardo el endpoint y los argumentos en el contexto
        g.args = args
        g.matched_endpoint = matched_endpoint
    except Exception as e:
        logger.error(f"Error al buscar el endpoint <{request.path}>: {str(e)}")
        # Si no encuentra el endpoint, aborto con 500
        abort(500, description=f"Error al buscar el endpoint <{request.path}>")

    return service_route


# Funcion que obtiene el endpoint internos del servicio de componentes
def component_endpoints():
    endpoint = current_app.view_functions[request.endpoint or ""]

    if not hasattr(endpoint, "_security_metadata"):
        abort(404, description=f"El endpoint <{request.path}> no existe")

    return endpoint._security_metadata
