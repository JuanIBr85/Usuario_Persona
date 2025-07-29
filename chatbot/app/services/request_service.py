from common.services.service_request import ServiceRequest
from common.utils.ttl_cache_util import TTLCacheUtil

# Cache para almacenar las respuestas de los microservicios durante 10 minutos
request_cache = TTLCacheUtil(maxsize=100, ttl=60*10)

def request_service(url: str):
    """
    Metodo que hace una peticion a un microservicio y cachea su respuesta
    """
    # Metodo que hace la peticion a un microservicio
    def call_service(url: str) -> None:
        try:
            r = ServiceRequest.get(url)
            if r.ok:
                return r.json()
            else:
                return None
        except Exception as e:
            return None

    # Obtiene la respuesta del cache o hace la peticion
    response = request_cache.get_or_cache(url, lambda: call_service(url))
    
    # Si no hay respuesta, se borra del cache
    if not response:
        request_cache.pop(url)

    return response