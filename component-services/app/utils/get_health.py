import time
from common.services.service_request import ServiceRequest
from cachetools import TTLCache

# Este cache esta para evitar estar consultando al servicio si esta levantado
# Esta pensado para casos en que internamente el servicio de componentes requiera saber el estado del servicio
# Esta configurado a 30s 
health_cache = TTLCache(maxsize=100, ttl=30)


# Compruebo si el servicio esta o no "vivo"
def get_health(service_url) -> bool:

    # Si esta en cache respondo con el
    if service_url in health_cache:
        return health_cache[service_url]
    try:
        # Si no esta en cache se lo consulto al servicio
        req = ServiceRequest.get(f"{service_url}/component_service/health")
        status = req.status_code == 200
        health_cache[service_url] = status
        return status
    except:
        health_cache[service_url] = False
        return False
