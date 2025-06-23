import ipaddress
from flask import request


def is_local_connection():
    """
    Detecta si la conexión viene de localhost o de la misma red local/Docker.

    Returns:
        bool: True si es conexión local/Docker, False si viene de internet
    """
    # Obtener la IP del cliente
    try:
        ip_obj = ipaddress.ip_address(request.remote_addr)

        # Verificar si es localhost (127.0.0.1 o ::1)
        if ip_obj.is_loopback:
            return True

        # Verificar si es una IP privada (incluye redes Docker)
        # Redes privadas: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
        if ip_obj.is_private:
            return True

        # Si llegamos aquí, es una IP pública
        return False

    except ValueError:
        # Si no se puede parsear la IP, asumir que es externa
        return False
