from typing import Callable
#from app.extensions import cache
from common.models.endpoint_route_model import EndpointRouteModel
from flask import request
import logging
from app.utils.redis_cache_util import RedisCacheUtil

r_cache = RedisCacheUtil(200, 10)

# Este metodo sirve para cachear respuestas de los endpoints
def cache_response(callback:Callable, url:str, endpoint:EndpointRouteModel):
    cache_params = ""

    params = endpoint.cache["params"]

    # Genero la key para el endpoint
    cache_params = "_".join([f"{k}:{v}" for k,v in request.args.items() if k in params])
    cache_key = f"cache_{url}_{cache_params}_{request.method}"
    
    return r_cache.from_cache(cache_key, endpoint.cache["expiration"], callback)