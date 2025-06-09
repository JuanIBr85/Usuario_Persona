from flask import request, Response, Blueprint, stream_with_context, jsonify      
import requests
from app.extensions import services_config
import mimetypes
from app.routes.api_gateway import services_route


bp = Blueprint('routes2', __name__)

@bp.route('/', defaults={'path': ''}, methods=['GET'])
@bp.route('/<path:path>', methods=['GET'])
#esto es temoporal hasta que se resuelva por donde va el servidor
def proxy_static_files(path):
    """
    Proxy que redirige todas las peticiones GET al servidor web estático
    Maneja tanto la ruta raíz como cualquier archivo estático
    """
    
    try:
        # Construir la URL completa
        target_url = f"http://{services_config['static_server']}/{path}"
        
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



@bp.route('/endpoints', methods=['GET'])
def api_gateway():
    output = []
    for endpoint in services_route:
        output.append(services_route[endpoint].to_dict())
    return jsonify(output)