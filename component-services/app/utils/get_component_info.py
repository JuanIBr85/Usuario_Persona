import time
from common.services.service_request import ServiceRequest
import logging


# Obtiene la informacion desde los servicios
def get_component_info(service_url, wait=False) -> list[str] | None:
    error_cnt = 0
    while True:
        try:
            # logging.warning(msg=f"Conectando con {service_url}...")
            req = ServiceRequest.get(f"{service_url}/component_service/info")
            return req.json()
        except Exception as e:
            # logging.error(msg=f"Error al conectarse con {service_url}: {str(e)}")
            #Si no se espera, o se han intentado 10 veces, sale
            error_cnt += 1
            if not wait or error_cnt > 10:
                break
            time.sleep(1)
