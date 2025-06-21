from flask import g, request
from app.extensions import limiter as _limiter
from common.decorators.api_access import api_access


# Decorador de endpoints del servicio de componentes
# Este no implementa cache, capaz a futuro
def cp_api_access(
    is_public: bool = False,
    access_permissions: list[str] | None = None,
    limiter: list[str] | None = None,
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

        api_access(
            is_public=is_public,
            access_permissions=access_permissions,
            limiter=limiter,
        )(f)

        return f

    return decorador
