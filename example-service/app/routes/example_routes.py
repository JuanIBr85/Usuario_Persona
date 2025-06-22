from flask import Blueprint, request
from common.decorators.api_access import CacheSettings, api_access
from common.utils.response import make_response, ResponseStatus

bp = Blueprint("example", __name__, cli_group="example")


@bp.route("/")
@api_access(is_public=True)
# Esta es una ruta publica, accesible sin autenticacion
def example():
    return (
        make_response(ResponseStatus.SUCCESS, "Bienvenido a la API de Componentes"),
        200,
    )


@bp.route("/ruta_solo_registrado")
@api_access(is_public=False)
# Esta es una ruta solo para usuarios autenticados, no requiere de ningun permiso para acceder
def ruta_solo_registrado():
    return (
        make_response(
            ResponseStatus.SUCCESS,
            {
                "message": "Bienvenido a la API de Componentes usuario registrado",
                "USER_ID": request.headers.get(
                    "X-USER-ID", "No deberias de ver esto, Usa la api gateway"
                ),
                "USER_AGENT": request.headers.get(
                    "X-CLIENT-USER-AGENT", "No deberias de ver esto, Usa la api gateway"
                ),
                "CLIENT_IP": request.headers.get(
                    "X-CLIENT-IP", "No deberias de ver esto, Usa la api gateway"
                ),
            },
        ),
        200,
    )


@bp.route("/ruta_solo_admin")
@api_access(is_public=False, access_permissions=["example.admin.admin_dice"])
# Esta es una ruta solo para usuarios autenticados con el permiso example.admin.admin_dice
def ruta_solo_admin():
    return (
        make_response(ResponseStatus.SUCCESS, "El admin dice HOLA!"),
        200,
    )


@bp.route("/rutas_limitadas")
@api_access(is_public=True, limiter=["2 per minute"])
# Esta es una ruta limitada a 2 peticiones por minuto
def rutas_limitadas():
    return (
        make_response(ResponseStatus.SUCCESS, "Recargame 3 veces"),
        200,
    )


@bp.route("/rutas_cacheadas")
# 30segundos
@api_access(is_public=True, cache=CacheSettings(expiration=30))
# Esta es una ruta cacheada, se expira cada 30 segundos
# Si se llama mas de una vez en los 30 segundos, solo se ejecuta la primera
# y el mismo resultado retorna en todas las demas peticiones
# hasta que expire el cache


def rutas_cacheadas():
    return (
        make_response(ResponseStatus.SUCCESS, "Esto estara en cache por 30 segundos"),
        200,
    )


@bp.route("/rutas_cacheadas_parametros")
@api_access(is_public=True, cache=CacheSettings(expiration=30, params=["a", "b"]))
# Esta es una ruta cacheada, se expira cada 30 segundos
# Si se llama mas de una vez en los 30 segundos, solo se ejecuta la primera
# y el mismo resultado retorna en todas las demas peticiones
# hasta que expire el cache
# esta ruta evalua los parametros a y b para generar la cache
def rutas_cacheadas_parametros():
    a = request.args.get("a", "No se envio a")
    b = request.args.get("b", "No se envio b")
    return (
        make_response(
            ResponseStatus.SUCCESS,
            {
                "a": a,
                "b": b,
                "message": "Esto estara en cache por 30 segundos",
            },
        ),
        200,
    )
