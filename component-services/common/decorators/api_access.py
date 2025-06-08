from types import SimpleNamespace
from functools import wraps

def api_access(is_public: bool = False, access_permissions: list[str] = None, methods: list[str] = None):
    
    def decorator(f):
        
        # Guardar los metadatos en la función
        f._security_metadata = SimpleNamespace(
            is_public=is_public,
            access_permissions=tuple(set(access_permissions or [])),
            methods=tuple(set(methods or []))
        )
        

        @wraps(f)
        def decorated_function(args, **kwargs):
            return f(args, **kwargs)
        
        # Copiar los metadatos a la función decorada
        decorated_function._security_metadata = f._security_metadata
        return decorated_function

    return decorator