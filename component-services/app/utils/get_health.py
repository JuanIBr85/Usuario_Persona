import time
from common.services.service_request import ServiceRequest
from common.utils.ttl_cache_util import TTLCacheUtil

# Este cache esta para evitar estar consultando al servicio si esta levantado
# Esta pensado para casos en que internamente el servicio de componentes requiera saber el estado del servicio
# Esta configurado a 30s 
health_cache = TTLCacheUtil(maxsize=100, ttl=30)


# Compruebo si el servicio esta o no "vivo"
def get_health(service_url, ignore_cache: bool = False) -> bool:
    try:
        if ignore_cache:
            health_cache.pop(service_url)

        # Si no esta en cache se lo consulto al servicio
        return health_cache.get_or_cache(service_url, lambda: ServiceRequest.get(url=f"{service_url}/component_service/health", timeout=10).status_code == 200)
    except Exception as e:
        return False
