import time
import requests


# Obtiene la informacion desde los servicios
def get_health(service_url) -> bool:
    try:
        req = requests.get(f"{service_url}/component_service/health")
        return req.status_code == 200
    except:
        return False
