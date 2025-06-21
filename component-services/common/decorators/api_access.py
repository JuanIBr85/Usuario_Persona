from common.models.endpoint_route_model import EndpointRouteModel
from common.models.cache_settings import CacheSettings
import re
from common.utils.get_component_info import get_component_info

component_permissions = set(get_component_info()["permissions"])


def api_access(
    is_public: bool = False,
    access_permissions: list[str] | None = None,
    limiter: list[str] | None = None,
    cache: CacheSettings | None = None,
):
    def decorador(f):
        if cache and not isinstance(cache, CacheSettings):
            raise ValueError("cache debe ser una instancia de CacheSettings")

        if access_permissions:
            regex = r"^[a-z]+\.[a-z]+\.[a-z]+(_[a-z]+)*$"
            for perm in access_permissions:
                if not isinstance(perm, str) or not re.match(regex, perm):
                    raise ValueError(
                        f"access_permissions debe ser una lista de strings que cumplan el formato <servicio>.<grupo>.<permiso> todo en minusculas"
                    )

                if perm not in component_permissions:
                    raise ValueError(
                        f"El permiso {perm} no esta definido en el archivo component-info.yml"
                    )

        # Guardar los metadatos en la función
        f._security_metadata = EndpointRouteModel(
            is_public=is_public,
            access_permissions=tuple(set(access_permissions or [])),
            limiter=limiter if limiter is None else ";".join(limiter),
            cache=cache.__dict__ if cache else None,
        )
        return f

    return decorador
