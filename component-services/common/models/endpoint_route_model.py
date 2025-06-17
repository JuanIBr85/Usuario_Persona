from typing import Dict, Any, Optional, Set, List, Collection
import json


# Modelo que se usa para el seguimiento de rutas
class EndpointRouteModel:

    def __init__(
        self,
        api_url: str | None = None,
        is_public: bool = True,
        access_permissions: Optional[Collection[str] | None] = None,
        methods: Optional[Set[str] | None] = None,
        limiter: Optional[Collection[str] | None] = None,
        cache: Optional[Dict[str, Any] | None] = None,
        access_url: str = "",
    ):
        self.api_url = api_url
        self.is_public = is_public
        self.access_permissions = set(access_permissions or [])
        self.methods = set(methods or [])
        self.limiter = limiter
        self.cache = cache
        self.access_url = access_url

    def to_dict(self) -> Dict[str, Any]:
        """
        Convierte la instancia a un diccionario.
        """
        return {
            k: v if not isinstance(v, set) else tuple(v)
            for k, v in self.__dict__.items()
        }

    def __str__(self) -> str:
        return json.dumps(self.to_dict(), indent=4)

    def __repr__(self) -> str:
        return json.dumps(self.to_dict(), indent=4)
