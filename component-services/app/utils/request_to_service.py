from flask import request, g
from common.services.service_request import ServiceRequest

# Headers que se envian al microservicio
SAFE_HEADERS = (
    "ACCEPT",
    "ACCEPT-LANGUAGE",
    "CONTENT-TYPE",
    "AUTHORIZATION",
)

# Headers que SÍ pueden ser reenviados desde los microservicios al cliente (Lista Blanca)
ALLOWED_RESPONSE_HEADERS = (
    "CONTENT-TYPE",  # Tipo de contenido
    "CONTENT-LANGUAGE",  # Idioma del contenido
    "CONTENT-DISPOSITION",  # Para descargas de archivos
    "CONTENT-RANGE",  # Para respuestas parciales (HTTP 206)
    "ACCEPT-RANGES",  # Indica si el servidor soporta rangos
    "CONTENT-SECURITY-POLICY",  # Política de seguridad del contenido
    "LOCATION",  # Para respuestas 201 Created y redirects
    "ALLOW",  # Para respuestas 405 Method Not Allowed
    "LINK",  # Para paginación (RFC 5988)
    "X-TOTAL-COUNT",  # Total de elementos
    "X-PAGE-COUNT",  # Total de páginas
    "X-CURRENT-PAGE",  # Página actual
    "X-PER-PAGE",  # Elementos por página
    "CONTENT-LENGTH",  # Tamaño del contenido
    "ACCEPT-ENCODING",  # Codificaciones soportadas
    "DEPRECATION",  # RFC 8594 - indica que el endpoint está deprecado
    "SUNSET",  # RFC 8594 - fecha cuando el endpoint será removido
)

# Este metodo envia una request al microservicio y retorna la respuesta
def request_to_service(url:str):
    # se remueven los parametros de los headers, para evitar errores
    headers = {
        key: value for key, value in request.headers if key.upper() in SAFE_HEADERS
    }

    # Si tiene el token, lo agrego a los headers
    if hasattr(g, "jwt"):
        # Guardo el id del usuario en X-USER-ID en el header
        headers["X-USER-ID"] = g.jwt["sub"]
        headers["X-JWT-JTI"] = g.jwt["jti"]
        headers["X-JWT-JTI-REFRESH"] = g.jwt["jti_refresh"]
        

    headers["X-CLIENT-IP"] = request.remote_addr
    headers["X-CLIENT-USER-AGENT"] = request.user_agent.string
    # Armo la request para enviar al microservicio con todos los datos recibidos
    # Envio la request al microservicio
    response = ServiceRequest.request(
        method=request.method,
        **{
            "url": url,
            "headers": headers,
            "params": request.args,
            "json": request.get_json() if request.is_json else None,
            "data": request.form if not request.is_json else None,
        },
        timeout=60  # para prevenir que el request se quede indefinidamente esperando
    )

    # Filtrar headers que Flask no debe reenviar
    response_headers = {
        key: value
        for key, value in response.headers.items()
        if key.upper() in ALLOWED_RESPONSE_HEADERS
    }

    return {
        "response": response.content,
        "status": response.status_code,
        "headers": response_headers,
        "mimetype": response.headers.get("content-type"),
    }
