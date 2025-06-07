from flask import Flask, abort, jsonify, request, g, Response, Blueprint, current_app, stream_with_context      
import requests
from werkzeug.routing import Map, Rule
from app.models.endpoint_route_model import EndpointRouteModel
from app.utils.make_endpoints_list import make_endpoints_list

import mimetypes
from time import sleep

endpoints = {}

print("Esperando servicios")
while True:
    sleep(1)
    try:
        auth_service_endpoints = requests.get('http://auth-service:5000/components').json()
        persona_service_endpoints = requests.get('http://persona-backend:5001/components').json()
        endpoints = {**auth_service_endpoints, **persona_service_endpoints}

        break
    except Exception:
        continue
print(f"Endpoints cargados, total: {len(endpoints)}")


# Diccionario de servicios
_services_route = {
    k:EndpointRouteModel(**endpoint) for k, endpoint in endpoints.items()
}

# Creamos reglas de ruta para mapear los endpoints con métodos
rules = [Rule(f"/api/{path}", endpoint=path, methods=_services_route[path].methods) for path in _services_route]
url_map = Map(rules)

# Creamos un Blueprint
bp = Blueprint('routes', __name__)
bp2 = Blueprint('routes2', __name__)

@bp.before_request
def authenticate_request():
    if not request.path.startswith("/api"):
        abort(401, description=f"El endpoint <{request.path}> no es publico")

    adapter = url_map.bind_to_environ(request.environ)
    try:
        matched_endpoint, args = adapter.match()
        service_route = _services_route[matched_endpoint]
        
        if not service_route.is_public:
            # Aquí puedes agregar lógica para validar autenticación/autorización
            abort(401, description=f"El endpoint <{request.path}> requiere autenticación")

        g.service_route = service_route
        g.args = args

    except Exception:
        abort(404, description=f"El servicio '{request.path}' no existe")
    

@bp2.route('/', defaults={'path': ''}, methods=['GET'])
@bp2.route('/<path:path>', methods=['GET'])
def proxy_static_files(path):
    """
    Proxy que redirige todas las peticiones GET al servidor web estático
    Maneja tanto la ruta raíz como cualquier archivo estático
    """
    
    try:
        # Construir la URL completa
        target_url = f"http://persona-frontend:5173/{path}"
        
        # Obtener parámetros de query si existen
        if request.query_string:
            target_url += f"?{request.query_string.decode()}"
        
        # Realizar la petición al servidor web
        response = requests.get(
            target_url,
            headers={key: value for key, value in request.headers if key != 'Host'},
            timeout=30,
            stream=True
        )
        
        # Determinar el tipo de contenido
        content_type = response.headers.get('Content-Type')
     
        if not content_type and path:
            
            # Intentar determinar el tipo MIME por extensión
            content_type, _ = mimetypes.guess_type(path)
            if not content_type:
                content_type = 'application/octet-stream'
            
        # Preparar headers para la respuesta
        response_headers = {}
        
        # Copiar headers importantes del servidor origen
        important_headers = [
            'content-type', 'content-length', 'last-modified', 
            'etag', 'cache-control', 'expires'
        ]
        
        for header in important_headers:
            if header in response.headers:
                response_headers[header] = response.headers[header]
        
        # Si determinamos un content-type, usarlo
        if content_type:
            response_headers['Content-Type'] = content_type
        
        # Agregar headers CORS si es necesario
        response_headers['Access-Control-Allow-Origin'] = '*'
        response_headers['Access-Control-Allow-Methods'] = 'GET'
        
        # Retornar la respuesta streaming para archivos grandes
        return Response(
            stream_with_context(response.iter_content(chunk_size=8192)),
            status=response.status_code,
            headers=response_headers
        )
        
    except requests.exceptions.Timeout:
        return {"error": "Timeout al conectar con el servidor web"}, 504
    except requests.exceptions.ConnectionError:
        return {"error": "No se pudo conectar al servidor web en localhost:5173"}, 503
    except requests.exceptions.RequestException as e:
        return {"error": "Error al procesar la petición", "details": str(e)}, 500
    except Exception as e:
        return {"error": "Error interno del servidor", "details": str(e)}, 500


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
    
