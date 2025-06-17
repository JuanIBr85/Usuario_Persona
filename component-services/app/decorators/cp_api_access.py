from common.models.endpoint_route_model import EndpointRouteModel
from flask import g, request
from app.extensions import limiter as _limiter


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
            limit_value=lambda: g.service_route.limiter,
            key_func=lambda: f"{request.remote_addr}:{request.endpoint}",
            exempt_when=lambda: g.service_route.limiter is None,
        )(f)

        # Guardar los metadatos en la función
        f._security_metadata = EndpointRouteModel(
            is_public=is_public,
            access_permissions=tuple(set(access_permissions or [])),
            limiter=limiter if limiter is None else ";".join(limiter),
        )
        return f

    return decorador
