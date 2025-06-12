from flask import abort, request, g, Response, Blueprint, current_app      
import requests
from werkzeug.routing import Map, Rule
from common.models.endpoint_route_model import EndpointRouteModel
from app.extensions import services_config
import time
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required
import json
from app.extensions import limiter
# Creamos un Blueprint
bp = Blueprint('gateway', __name__)

endpoints = {}
print("Esperando servicios")
for service in services_config["services"]:
    print(f"Esperando a {service['name']}") 
    while True:
        try:
            service_url = f"http://{service['url']}"
            response = requests.get(f"{service_url}/component_service/endpoints").json()
            
            for k,v in response.items():
                v["api_url"] = f"{service_url}{v['api_url']}"
            endpoints.update(response)
            break
        except Exception:
            time.sleep(1)
    print(f"{service['name']} listo")
print(f"Endpoints cargados, total: {len(endpoints)}")

# Diccionario de servicios
services_route = {
    k:EndpointRouteModel(**endpoint) for k, endpoint in endpoints.items()
}

# Creamos reglas de ruta para mapear los endpoints con métodos
rules = [Rule(f"/api/{path}", endpoint=path, methods=services_route[path].methods) for path in services_route]
url_map = Map(rules)


@bp.before_request
@jwt_required(optional=True)
def authenticate_request():
    #Probablemente ya no sea necesario
    if not request.path.startswith("/api"):
        abort(401, description=f"El endpoint <{request.path}> no es publico")

    #Buscamos el endpoint en el diccionario
    adapter = url_map.bind_to_environ(request.environ)
    try:
        #Si encuentra el endpoint, retorna el endpoint y los argumentos
        matched_endpoint, args = adapter.match()
        #Obtengo el endpoint del diccionario
        service_route = services_route[matched_endpoint]
    except Exception:
        #Si no encuentra el endpoint, aborto con 404
        abort(404, description=f"El servicio '{request.path}' no existe")
    
    #Verifico si el usuario tiene un token
    identity = get_jwt_identity()
    #Si no tiene el token y no es publico, aborto con 401
    if not service_route.is_public:
        #Si no tiene token se rechaza el acceso
        if not identity:
            abort(401, description=f"El endpoint <{request.path}> requiere autenticación")
         
        payload = get_jwt()

        #Si no tiene los permisos necesario para acceder al endpoint se rechaza el acceso
        if not service_route.access_permissions.issubset(payload.get("perms", [])):
            abort(403, description=f"Acceso denegado: se requieren permisos {service_route.access_permissions}")


    #Si tiene el token, lo guardo en el contexto
    if identity:
        g.jwt = get_jwt()

    #Guardo el endpoint y los argumentos en el contexto
    g.service_route = service_route
    g.args = args
    g.matched_endpoint = matched_endpoint

#Esto toma todo lo que entre por service por cualquier metodo
@bp.route('/api/<path:subpath>', methods=['GET', 'POST', 'PUT', 'DELETE'])

@limiter.limit(
    #Reglas de limite
    limit_value=lambda: g.service_route.limiter,   
    #Una clave unica que identifica el cliente
    key_func=lambda: f"{request.remote_addr}:{g.matched_endpoint}", 
    #Excepcion cuando no hay limite
    exempt_when=lambda: g.service_route.limiter is None
)
def api_gateway_api(subpath):
    endpoint = g.service_route
    
    #se remueven los parametros de los headers, para evitar errores
    headers = {key: value for key, value in request.headers if key.upper() not in [
            "HOST", 
            "ACCEPT-ENCODING",
            "CONNECTION",
            "CONTENT-LENGTH",
            "TRANSFER-ENCODING",
            "KEEP-ALIVE"
    ]}

    #Si tiene el token, lo agrego a los headers
    if hasattr(g, "jwt"):
        #Guardo el id del usuario en X-USER-ID en el header
        headers["X-USER-ID"] = g.jwt["sub"]

    #Si tiene argumentos, los agrego a la url
    args = ""
    if len(g.args) > 0:
        args = "/".join([str(x) for x in g.args.values()])
        args = f"/{args}"


    #Armo la request para enviar al microservicio con todos los datos recibidos
    _request = {
        "url":f"{endpoint.api_url}{args}",
        "headers": headers,
        "params":request.args,
        "json":request.get_json() if request.is_json else None,
        "data":request.form if not request.is_json else None
    }

    #Envio la request al microservicio
    response = requests.request(method=request.method, **_request)

    # Filtrar headers que Flask no debe reenviar
    excluded_headers = ['content-encoding', 'content-length', 'transfer-encoding', 'connection']
    response_headers = {
        key: value for key, value in response.headers.items() 
        if key.lower() not in excluded_headers
    }

    # Devolver la respuesta completa con headers, contenido y status code
    return Response(
        response=response.content,
        status=response.status_code,
        headers=response_headers,
        mimetype=response.headers.get('content-type')
    )  