from flask import abort, request, g, Response, Blueprint, current_app      
import requests
from werkzeug.routing import Map, Rule
from common.models.endpoint_route_model import EndpointRouteModel
from app.extensions import services_config
import time

# Creamos un Blueprint
bp = Blueprint('gateway', __name__)

endpoints = {}
print("Esperando servicios")
for service in services_config["services"]:
    break
    print(f"Esperando a {service['name']}") 
    while True:
        try:
            response = requests.get(f"http://{service['url']}/components").json()
            endpoints.update(response)
            break
        except Exception:
            time.sleep(1)
            continue
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
def authenticate_request():
    if not request.path.startswith("/api"):
        abort(401, description=f"El endpoint <{request.path}> no es publico")

    adapter = url_map.bind_to_environ(request.environ)
    try:
        matched_endpoint, args = adapter.match()
        service_route = services_route[matched_endpoint]
        
        if not service_route.is_public:
            # Aquí puedes agregar lógica para validar autenticación/autorización
            abort(401, description=f"El endpoint <{request.path}> requiere autenticación")

        g.service_route = service_route
        g.args = args

    except Exception:
        abort(404, description=f"El servicio '{request.path}' no existe")

#Esto toma todo lo que entre por service por cualquier metodo
@bp.route('/api/<path:subpath>', methods=['GET', 'POST', 'PUT', 'DELETE'])
def api_gateway_api(subpath):
    endpoint = g.service_route
    #se remueve el parametro 'Host' y el 'Accept-Encoding' de los headers, para evitar errores
    headers = {key: value for key, value in request.headers if key.upper() not in [
            "HOST", 
            "ACCEPT-ENCODING",
            "CONNECTION",
            "CONTENT-LENGTH",
            "TRANSFER-ENCODING",
            "KEEP-ALIVE"
    ]}

    args = ""
    if len(g.args) > 0:
        args = "/".join([str(x) for x in g.args.values()])
        args = f"/{args}"

    current_app.logger.warning(f"URL: {endpoint.api_url}{args}")

    #Armo la request para enviar al microservicio con todos los datos recibidos
    _request = {
        "url":f"{endpoint.api_url}{args}", #Esta es la url donde esta alojado el endpoint del microservicio
        "headers": headers,
        "params":request.args,
        "json":request.get_json() if request.is_json else None,
        "data":request.form if not request.is_json else None
    }
   
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