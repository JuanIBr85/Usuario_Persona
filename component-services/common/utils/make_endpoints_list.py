from typing import Dict
import re
from common.models.endpoint_route_model import EndpointRouteModel


def make_endpoints_list(app) -> Dict[str, EndpointRouteModel]:
    """
    Toma todos los endpoints de la aplicación Flask y devuelve solo aquellos
    que tienen el decorador @api_access, con su información de seguridad.

    Args:
        app: Instancia de la aplicación Flask

    Returns:
        Dict[str, EndpointRouteModel]: Diccionario con la información de los endpoints
        que tienen el decorador @api_access
    """
    endpoints = {}

    for rule in app.url_map.iter_rules():
        # Saltar endpoints estáticos
        if rule.endpoint == "static":
            continue
        # Obtener la función de vista asociada al endpoint
        view_func = app.view_functions.get(rule.endpoint)

        # Verificar si la función tiene el decorador api_access
        if view_func and hasattr(view_func, "_security_metadata"):
            # Obtener métodos HTTP permitidos (excluyendo HEAD y OPTIONS)
            methods = rule.methods - {"HEAD", "OPTIONS"}

            # Si no es un EndpointRouteModel, saltar este endpoint
            if not isinstance(view_func._security_metadata, EndpointRouteModel):
                continue

            # Si no hay métodos después del filtrado, saltar este endpoint
            if not methods:
                continue

            # Eliminar parámetros dinámicos de la ruta
            base_route = re.sub(r"<[^>]+>", "", rule.rule).rstrip("/")

            url = str(rule).removeprefix("/")

            endpoints[f"{url}_{'_'.join(methods)}"] = {
                "api_url": str(base_route),
                "access_url": url,
                "is_public": view_func._security_metadata.is_public,
                "methods": tuple(methods),
                "access_permissions": tuple(
                    view_func._security_metadata.access_permissions or []
                ),
                "limiter": view_func._security_metadata.limiter,
                "cache": view_func._security_metadata.cache,
            }

    return endpoints
