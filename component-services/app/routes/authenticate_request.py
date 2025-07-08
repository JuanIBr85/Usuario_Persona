from flask import abort, request, g, current_app
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required
from app.services.endpoints_search_service import EndpointsSearchService
from common.models.endpoint_route_model import EndpointRouteModel
import logging
from app.extensions import jwt, redis_client_auth
from app.utils.is_local_connection import is_local_connection
from common.utils.ttl_cache_util import TTLCacheUtil
from common.utils.response import make_response, ResponseStatus

logger = logging.getLogger(__name__)
endpoints_search_service = EndpointsSearchService()

# Cache para los permisos de los usuarios para evitar sobre cargar redis
jwt_cache = TTLCacheUtil(maxsize=1000, ttl=20)


# Obtengo los permisos del usuario
def get_jwt_permissions(jti):
    # Si esta en el cache devuelvo los permisos
    # sino consulto a redis
    def get_perms():
        perms = redis_client_auth.lrange(jti, 0, -1)
        if not perms:
            return None
        return set(perms)
    return jwt_cache.get_or_cache(jti, get_perms)


# Comprueba que el token no alla sido revocado
@jwt.token_in_blocklist_loader
def check_if_token_is_revoked(jwt_header, jwt_payload: dict):
    jti = jwt_payload["jti"]
    # Si esta en el cache es un token valido
    if jti in jwt_cache:
        return False

    # Si no esta en el cache compruebo si esta en redis
    return get_jwt_permissions(jti) is None


# Manejo de errores JWT más específico
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return (
        make_response(
            ResponseStatus.FAIL,
            "El token ha expirado. Por favor, inicie sesión nuevamente.",
            {"message": "Token expirado"},
        ),
        401,
    )


@jwt.invalid_token_loader
def invalid_token_callback(error):
    return (
        make_response(
            ResponseStatus.FAIL,
            "El token proporcionado es inválido.",
            {"message": "Token inválido"},
        ),
        401,
    )


@jwt.unauthorized_loader
def missing_token_callback(error):
    return (
        make_response(
            ResponseStatus.FAIL,
            "No se proporcionó un token de autenticación.",
            {"message": "Token no proporcionado"},
        ),
        401,
    )


def authenticate_config(app):
    # Rate limit handler
    @app.errorhandler(429)
    def ratelimit_handler(e):
        return (
            make_response(
                ResponseStatus.FAIL,
                f"Ha intentado ingresar demasiadas veces a esta ruta: {e.description}",
                {"message": "Ha intentado ingresar demasiadas veces a esta ruta"},
            ),
            429,
        )

    @app.before_request
    @jwt_required(optional=True)
    def authenticate_request():

        if request.method == "OPTIONS":
            return

        # Si es una peticion local, no se verifica la autenticacion
        if request.path.startswith("/internal") and is_local_connection():
            return

        # Si es una peticion a un endpoint que no existe, aborto con 404
        if not request.path.startswith("/api") or request.endpoint is None:
            abort(404, description=f"El endpoint <{request.path}> no existe")

        # Si es una peticion al endpoint de gateway, obtengo el endpoint
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

            # Si el endpoint no requiere permisos, se permite el acceso
            if not service_route.access_permissions or len(service_route.access_permissions) == 0:
                return

            # Obtengo los permisos del usuario
            permisos_usuario = get_jwt_permissions(payload["jti"])

            # Si no tiene los permisos necesario para acceder al endpoint se rechaza el acceso
            if permisos_usuario is None or not service_route.access_permissions.issubset(permisos_usuario):
                abort(
                    403,
                    description=f"Acceso denegado: se requieren permisos {', '.join(tuple(service_route.access_permissions))}",
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
        # Si no encuentra el endpoint, aborto con 500
        abort(500, description=f"Error al buscar el endpoint <{request.path}>")

    return service_route


# Funcion que obtiene el endpoint internos del servicio de componentes
def component_endpoints():
    endpoint = current_app.view_functions[request.endpoint or ""]

    if not hasattr(endpoint, "_security_metadata"):
        abort(404, description=f"El endpoint <{request.path}> no existe")

    return endpoint._security_metadata
