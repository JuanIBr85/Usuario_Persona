from typing import List, Dict, Any, Set
import re

def make_endpoints_list(app) -> List[Dict[str, Any]]:
    """
    Toma todos los endpoints de la aplicación Flask y devuelve solo aquellos
    que tienen el decorador @api_access, con su información de seguridad.
    
    Args:
        app: Instancia de la aplicación Flask
        
    Returns:
        List[Dict[str, Any]]: Lista de diccionarios con la información de los endpoints
        que tienen el decorador @api_access
    """
    endpoints = {}
    
    for rule in app.url_map.iter_rules():
        # Saltar endpoints estáticos
        if rule.endpoint == 'static':
            continue
        # Obtener la función de vista asociada al endpoint
        view_func = app.view_functions.get(rule.endpoint)
        
        # Verificar si la función tiene el decorador api_access
        if view_func and hasattr(view_func, '_security_metadata'):
            # Obtener métodos HTTP permitidos (excluyendo HEAD y OPTIONS)
            methods = sorted(rule.methods - {'HEAD', 'OPTIONS'})
            
            # Si hay métodos específicos definidos en el decorador, filtrar por ellos
            if hasattr(view_func._security_metadata, 'methods') and view_func._security_metadata.methods:
                methods = [m for m in methods if m in view_func._security_metadata.methods]
            
            # Si no hay métodos después del filtrado, saltar este endpoint
            if not methods:
                continue
                
            # Eliminar parámetros dinámicos de la ruta
            base_route = re.sub(r'<[^>]+>', '', rule.rule).rstrip('/')
            
            # Usar la información de seguridad del decorador
            is_public = getattr(view_func._security_metadata, 'is_public', False)
            
            endpoints[str(rule).removeprefix("/")] = {
                "api_url": str(base_route),
                "is_public": is_public,
                "methods": methods,
                "access_permissions": list(getattr(view_func._security_metadata, 'access_permissions', []))
            }
    
    return list(endpoints.values())

def make_service_response(app, name):
    return {
        "name":name,
        "endpoints":make_endpoints_list(app)
    }