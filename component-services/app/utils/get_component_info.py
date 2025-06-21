import time
import requests


# Obtiene la informacion desde los servicios
def get_component_info(service_url, wait=False) -> list[str] | None:
    while True:
        try:
            req = requests.get(f"{service_url}/component_service/info")
            return req.json()
        except:
            if not wait:
                break
            time.sleep(1)
