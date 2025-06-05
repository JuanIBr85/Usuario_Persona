from functools import wraps

def requiere_permisos(permisos):
    def decorador(func):
        func._security_metadata = {
            "is_public": False,
            "access_permissions": permisos
        }
        @wraps(func)
        def wrapper(*args, **kwargs):
            return func(*args, **kwargs)
        return wrapper
    return decorador

#es para ahorrar escribir el is_public:true...etc
def ruta_publica(func):
    func._security_metadata = {
        "is_public": True
    }
    return func

#crear decorador para la 2fa.