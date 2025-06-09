from common.models.endpoint_route_model import EndpointRouteModel

def api_access(is_public: bool = False, access_permissions: list[str] = None):
    def decorador(f):
        # Guardar los metadatos en la función
        f._security_metadata = EndpointRouteModel(
            is_public=is_public,
            access_permissions=tuple(set(access_permissions or []))
        )
        return f

    return decorador