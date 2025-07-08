from flask import g, request
from app.extensions import limiter as _limiter
from common.decorators.api_access import api_access
from .cache_decorator import cache_decorator
from common.models.cache_settings import CacheSettings

# Decorador de endpoints del servicio de componentes
# Debido a que los endpoints de componentes no pasan por la api gateway requieren implementar
# el cache y el límite de peticiones por separado
def cp_api_access(
    is_public: bool = False,
    access_permissions: list[str] | None = None,
    limiter: list[str] | None = None,
    cache: CacheSettings | None = None
):
    def decorador(f):
        # Aplicar el decorador de límite a la función
        f = _limiter.limit(
            limit_value=lambda: (
                g.service_route.limiter if hasattr(g, "service_route") else None
            ),
            key_func=lambda: f"{request.remote_addr}:{request.endpoint}",
            exempt_when=lambda: g.service_route.limiter is None,
        )(f)

        # Aplicar el decorador de metadatos de seguridad a la función
        api_access(
            is_public=is_public,
            access_permissions=access_permissions,
            limiter=limiter,
            cache=cache
        )(f)

        # Aplicar el decorador de cache a la función
        if cache is not None:
            f = cache_decorator(f)

        return f

    return decorador
