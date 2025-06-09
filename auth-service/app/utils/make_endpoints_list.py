from typing import List, Dict, Any, Set
import re

def make_endpoints_list(app) -> List[Dict[str, Any]]:
    """
    Toma todos los endpoints de la aplicación Flask y los devuelve en una lista
    de objetos EndpointRouteModel.
    
    Args:
        app: Instancia de la aplicación Flask
        
    Returns:
        List[Dict[str, Any]]: Lista de diccionarios con la información de los endpoints
    """
    endpoints = {}
    current_url = "http://auth-service:5000"
    for rule in app.url_map.iter_rules():
        # Saltar endpoints estáticos
        if rule.endpoint == 'static':
            continue
            
        # Obtener métodos HTTP permitidos (excluyendo HEAD y OPTIONS)
        methods = sorted(rule.methods - {'HEAD', 'OPTIONS'})
        
        # Eliminar parámetros dinámicos de la ruta
        base_route = re.sub(r'<[^>]+>', '', rule.rule).rstrip('/')

        endpoints[str(rule).removeprefix("/")] = {
            "api_url":current_url+str(base_route),
            "is_public":True,  # Por defecto asumimos que es público
            "methods":methods  # Convertir la lista de métodos a un set
        }
    
    return endpoints