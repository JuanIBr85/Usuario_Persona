import time
import requests
from cachetools import TTLCache


health_cache = TTLCache(maxsize=100, ttl=30)


# Obtiene la informacion desde los servicios
def get_health(service_url) -> bool:
    try:
        if service_url in health_cache:
            return health_cache[service_url]
        req = requests.get(f"{service_url}/component_service/health", timeout=2)
        status = req.status_code == 200
        health_cache[service_url] = status
        return status
    except:
        return False
