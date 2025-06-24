import time
import requests
import logging


# Obtiene la informacion desde los servicios
def get_component_info(service_url, wait=False) -> list[str] | None:
    while True:
        try:
            # logging.warning(msg=f"Conectando con {service_url}...")
            req = requests.get(f"{service_url}/component_service/info")
            return req.json()
        except Exception as e:
            # logging.error(msg=f"Error al conectarse con {service_url}: {str(e)}")
            if not wait:
                break
            time.sleep(1)
