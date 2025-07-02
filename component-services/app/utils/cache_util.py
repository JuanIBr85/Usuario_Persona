from typing import Callable
from app.extensions import cache
from common.models.endpoint_route_model import EndpointRouteModel
from flask import request
import logging


# Este metodo sirve para cachear respuestas de los endpoints
def cache_response(callback:Callable, url:str, endpoint:EndpointRouteModel):
    cache_params = ""
    params = endpoint.cache["params"]

    # Genero la key para el endpoint
    cache_params = "_".join([f"{k}:{v}" for k,v in request.args.items() if k in params])
    cache_key = f"cache_{url}_{cache_params}_{request.method}"
    
    # Busco en cache la respuesta
    response = cache.get(cache_key)
    if response:
        return response 

    # Si no esta en cache llamo al callback para obtener los datos
    response = callback()

    # Guardo la respuesta en el cache
    cache.set(
        key = cache_key,
        value = response,
        expire = endpoint.cache["expiration"]
    )
    
    return response