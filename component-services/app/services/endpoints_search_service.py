from flask import request
import requests
from werkzeug.routing import Map, Rule
from app.services.services_serch_service import ServicesSearchService
from common.models.endpoint_route_model import EndpointRouteModel
from app.models.service_model import ServiceModel
import time
from app.extensions import logger


class EndpointsSearchService:
    """
    Servicio que busca y mapea los endpoints de los demás servicios para poder
    realizar peticiones a ellos desde este componente.
    """

    # Instancia única para implementar el patrón Singleton
    _instance = None

    # Almacena los endpoints de todos los servicios como diccionario
    _endpoints = {}

    # Diccionario que mapea rutas a sus respectivos modelos de endpoint
    _services_route = {}

    # Mapa de URLs para el enrutamiento de peticiones
    _url_map = None

    # Bandera para detener la búsqueda de endpoints
    _stop_search = False

    # Indica si hay una búsqueda de endpoints en progreso
    _search_in_progress = False

    _search_log = {}

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EndpointsSearchService, cls).__new__(cls)
        return cls._instance

    def _wait_for_service(
        self, service: ServiceModel
    ) -> dict[str, dict[str, str]] | None:
        # Contador de errores consecutivos
        error_cnt = 0

        # Bucle de reintentos hasta conexión exitosa o señal de parada
        while not self._stop_search:
            try:
                # Construye y realiza la petición al servicio
                service_url = service.service_url
                response = requests.get(
                    f"{service_url}/component_service/endpoints"
                ).json()

                # Resetea contador de errores en éxito
                error_cnt = 0

                self._search_log[service.service_name]["endpoints_count"] = len(
                    response
                )

                # Retorna diccionario de endpoints con URLs completas
                return {
                    k: {**v, "api_url": f"{service_url}{v['api_url']}"}
                    for k, v in response.items()
                }

            except Exception as e:
                # Manejo de errores con reintentos
                error_cnt += 1
                # Logea error cada minuto (60 intentos)
                if error_cnt % (60 * 1) == 0:
                    logger.error(f"Error conectando con {service.service_name}")
                self._search_log[service.service_name]["success"] = "error"
                self._search_log[service.service_name]["error"] = str(e)

                if not service.service_wait and error_cnt > 10:
                    self._search_log[service.service_name]["success"] = "timeout"
                    return None

                # Espera 1 segundo entre reintentos
                time.sleep(1)

    def _load_endpoints(self):
        # Inicialización de variables y registro de inicio
        logger.info("Iniciando carga de servicios")
        self._endpoints = {}
        self._search_in_progress = True
        self._search_log = {}

        self._stop_search = False
        services = ServicesSearchService().get_services()
        # Itera sobre cada servicio en la configuración
        for service in services:
            self._search_log[service.service_name] = {
                "in_progress": True,
                "success": "in_progress",
                "start_time": time.time(),
                "error": None,
                "endpoints_count": 0,
            }

            if service.service_available is False:
                self._search_log[service.service_name]["success"] = "not_available"
                self._search_log[service.service_name]["in_progress"] = False
                continue

            if self._stop_search:  # Verifica señal de parada
                self._search_log[service.service_name]["in_progress"] = False
                self._search_log[service.service_name]["success"] = "stop"
                logger.info(f"Parada de búsqueda de endpoints")
                break

            logger.info(f"Conectando con {service.service_name}...")
            try:
                # Obtiene endpoints del servicio actual
                service_endpoints = self._wait_for_service(service)
                if service_endpoints is None:
                    self._search_log[service.service_name][
                        "error"
                    ] = "No se pudo obtener endpoints"
                    continue

                # Actualiza el diccionario de endpoints
                self._endpoints.update(service_endpoints)
                self._search_log[service.service_name]["error"] = ""
                logger.info(
                    f"{service.service_name} - {len(service_endpoints)} endpoints cargados"
                )

                self._search_log[service.service_name]["success"] = "success"
            except Exception as e:
                logger.error(f"Error cargando {service.service_name}: {str(e)}")
                self._search_log[service.service_name]["error"] = str(e)
                self._search_log[service.service_name]["success"] = "error"
        self._search_log[service.service_name]["in_progress"] = False
        # Finalización de la carga
        self._search_in_progress = False
        logger.info(f"Carga completada. Total de endpoints: {len(self._endpoints)}")
        # Crea modelos de ruta para cada endpoint
        self._services_route = {
            k: EndpointRouteModel(**v) for k, v in self._endpoints.items()
        }
        # Actualiza el mapa de URLs
        self._update_url_map()

    def _update_url_map(self):
        """
        Actualiza el mapa de URLs con las rutas de los servicios.
        Crea reglas de enrutamiento para cada endpoint registrado.
        """
        # Crea un nuevo mapa de URLs con las reglas de enrutamiento
        self._url_map = Map(
            [
                # Para cada ruta, crea una regla con:
                # - URL base '/api/' + ruta de acceso del servicio
                # - Nombre del endpoint
                # - Métodos HTTP permitidos
                Rule(
                    f"/api/{self._services_route[path].access_url}",
                    endpoint=path,
                    methods=self._services_route[path].methods,
                )
                # Itera sobre todas las rutas de servicios registradas
                for path in self._services_route
            ],
            strict_slashes=False,
        )  # Permite URLs con o sin barra final

    def get_endpoints(self) -> dict[str, dict[str, str]] | None:
        """
        Devuelve todos los endpoints cargados
        """
        return self._endpoints

    def get_services_route(self) -> dict[str, EndpointRouteModel] | None:
        """
        Devuelve el diccionario de rutas de servicios
        """
        return self._services_route

    def get_url_map(self) -> Map | None:
        """
        Devuelve el mapa de URL configurado
        """
        return self._url_map

    def refresh_endpoints(self) -> bool:
        """
        Actualiza los endpoints de los servicios
        """
        self._load_endpoints()
        return True

    def stop_search(self):
        self._stop_search = True

    def is_search_in_progress(self):
        return self._search_in_progress

    def get_route(self) -> tuple[EndpointRouteModel, dict[str, str], str] | None:
        if self._url_map is None:
            raise Exception("No se ha cargado el mapa de URLs")

        # Crea un adaptador para el entorno actual de la petición
        adapter = self._url_map.bind_to_environ(request.environ)

        # Busca coincidencia para la URL solicitada
        # Retorna el nombre del endpoint y sus argumentos
        matched_endpoint, args = adapter.match()

        # Retorna la configuración completa del endpoint desde el diccionario
        endpoint_route = self._services_route[matched_endpoint]
        # Convertimos args a dict[str, str] para cumplir con el tipo de retorno
        args_dict = {k: str(v) for k, v in args.items()}
        return endpoint_route, args_dict, str(matched_endpoint)

    def get_search_log(self) -> dict[str, dict[str, str]]:
        return self._search_log or {}
