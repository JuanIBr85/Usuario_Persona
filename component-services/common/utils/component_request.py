from typing import Optional
from flask import request


class ComponentRequest:
    """
    Clase de utilidad para manejar información de la solicitud HTTP.
    Proporciona métodos estáticos para acceder a datos comunes de la solicitud.
    """

    @staticmethod
    def get_user_id() -> Optional[str]:
        """
        Obtiene el ID del usuario autenticado desde los headers de la solicitud.

        Returns:
            Optional[str]: El ID del usuario si está presente, None en caso contrario.
        """
        return request.headers.get("X-USER-ID")

    @staticmethod
    def get_user_agent() -> Optional[str]:
        """
        Obtiene el User-Agent del cliente que realizó la solicitud.

        Returns:
            Optional[str]: El User-Agent de la solicitud si está presente, None en caso contrario.
        """
        return request.headers.get("X-CLIENT-USER-AGENT")

    @staticmethod
    def get_ip() -> Optional[str]:
        """
        Obtiene la dirección IP del cliente que realizó la solicitud.
        Considera los headers de proxy como X-Forwarded-For si están presentes.

        Returns:
            Optional[str]: La dirección IP del cliente si se puede determinar, None en caso contrario.
        """
        return request.headers.get("X-CLIENT-IP")
