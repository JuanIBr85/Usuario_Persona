from common.models.endpoint_route_model import EndpointRouteModel
from common.models.cache_settings import CacheSettings

def api_access(
    is_public: bool = False, 
    access_permissions: list[str] = None, 
    limiter: list[str] = None,
    cache: CacheSettings = None
    ):
    def decorador(f):
        if cache and not isinstance(cache, CacheSettings):
            raise ValueError("cache debe ser una instancia de CacheSettings")
        
        # Guardar los metadatos en la función
        f._security_metadata = EndpointRouteModel(
            is_public=is_public,
            access_permissions=tuple(set(access_permissions or [])),
            limiter=limiter if limiter is None else ";".join(limiter),
            cache=cache.__dict__ if cache else None
        )
        return f

    return decorador