import logging
from app.models.service_model import ServiceModel
from app.services.servicio_base import ServicioBase
from app.schemas.service_schema import ServiceSchema
from app.utils.get_component_info import get_component_info
from common.utils.get_component_info import get_component_info as get_component_info_common
from app.utils.get_health import get_health
from app.extensions import logger
from typing import Dict

# Inicialización del servicio base para operaciones CRUD en la tabla de servicios
services_service: ServicioBase = ServicioBase(ServiceModel, ServiceSchema())


class ServicesSearchService:
    """
    Servicio para la gestión y búsqueda de servicios en el sistema.
    Implementa el patrón Singleton para asegurar una única instancia.
    Mantiene un caché de redirecciones para acceso rápido.
    """

    _instance = None
    _redirect_list: Dict[str, str] = {}

    def __new__(cls):
        # Implementación del patrón Singleton
        if cls._instance is None:
            cls._instance = super(ServicesSearchService, cls).__new__(cls)
        return cls._instance

    def get_services(self, ignore_not_live:bool=False) -> list[ServiceModel]:
        """
        Obtiene todos los servicios registrados en el sistema.

        Returns:
            list[ServiceModel]: Lista de modelos de servicios
        """
        services = services_service.get_all(not_dump=True)
        if services is None:
            return []

        if ignore_not_live:
            return list(filter(lambda x: get_health(x.service_url), services))
        else:
            return services

            
    def get_redirect(self, code: str) -> str | None:
        """
        Obtiene la URL de redirección asociada a un código.

        Args:
            code (str): Código de redirección

        Returns:
            str | None: URL de redirección o None si no existe
        """
        return self._redirect_list.get(code)

    def get_redirect_list(self) -> Dict[str, str]:
        """
        Obtiene el diccionario completo de códigos de redirección.

        Returns:
            Dict[str, str]: Diccionario con códigos como clave y URLs como valor
        """
        return self._redirect_list

    def update_redirect(self):
        """
        Actualiza la lista de redirecciones consultando a cada servicio.
        Obtiene información de cada servicio y extrae sus reglas de redirección.
        """

        services: list[ServiceModel] = services_service.query(
            lambda query: query.filter(ServiceModel.service_available == True).all(),
            not_dump=True,
        )
        redirect_list = []
        for service in services:
            # Obtiene información del componente/servicio
            info = get_component_info(service.service_url, wait=False)
            if info is None:
                continue

            # Si el servicio tiene reglas de redirección, las agrega a la lista
            if "redirect" in info:
                redirect_list.append(info["redirect"])

        # Actualiza el diccionario interno de redirecciones
        self._update_redirect_list(redirect_list)

    def _update_redirect_list(self, redirect_list: list[Dict]):
        """
        Actualiza internamente la lista de redirecciones.

        Args:
            redirect_list (list[Dict]): Lista de diccionarios con reglas de redirección
        """
        try:
            _redirect_list = {}
            # Procesa cada regla de redirección
            for redirect in redirect_list:
                for key, value in redirect.items():
                    _redirect_list[value["code"]] = value["url"]
            self._redirect_list = _redirect_list
        except Exception as e:
            logging.error(f"Error al actualizar la lista de redirecciones: {str(e)}")

    def get_permissions(self):
        """
        Recolecta y consolida roles y permisos de todos los servicios registrados.

        Returns:
            list: Lista consolidada de todos los permisos de los servicios
        """
        # Obtiene todos los servicios que esten activos
        services: list[ServiceModel] = self.get_services(True)
        perms = []
        roles = {}
        redirect = []

        # Recolecta permisos y redirecciones del servicio de componentes
        component_info = get_component_info_common()
        perms.extend(component_info["permissions"])
        roles.update(component_info["roles"])
        if "redirect" in component_info:
            redirect.append(component_info["redirect"])

        # Itera sobre cada servicio para recolectar permisos
        for service in services:
            logger.info(f"Recolectando permisos de {service.service_name}")
            info = get_component_info(service.service_url, wait=True)
            if info is None:
                logger.error(f"Error al recolectar permisos de {service.service_name}")
                continue

            # Agrega los permisos del servicio actual a la lista general
            perms.extend(info["permissions"])
            roles.update(info["roles"])
            # Aprovecha para actualizar la lista de redireccionamiento
            if "redirect" in info:
                redirect.append(info["redirect"])

        # Actualiza las redirecciones con la información más reciente
        self._update_redirect_list(redirect)

        return perms, roles
