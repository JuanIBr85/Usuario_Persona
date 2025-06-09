from typing import Dict, Any, Optional, Set, List, Union
import json

#Modelo que se usa para el seguimiento de rutas
class EndpointRouteModel:
    
    def __init__(
        self, api_url: str=None, is_public: bool = True,
        access_permissions: Optional[Dict[str, Any]] = None,
    ):
        self.api_url = api_url
        self.is_public = is_public
        self.access_permissions = access_permissions or {}
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convierte la instancia a un diccionario.
        """
        return {
            'api_url': self.api_url,
            'is_public': self.is_public,
            'access_permissions': self.access_permissions,
        }
    
    def __str__(self) -> str:
        return json.dumps(self.to_dict(), indent=4)
    
    def __repr__(self) -> str:
        return json.dumps(self.to_dict(), indent=4)
    