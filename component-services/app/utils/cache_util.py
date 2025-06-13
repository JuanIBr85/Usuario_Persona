from typing import Callable
from app.extensions import cache
from common.models.endpoint_route_model import EndpointRouteModel
from flask import request

def cache_response(callback:Callable, url:str, endpoint:EndpointRouteModel):
    cache_params = ""
    params = endpoint.cache["params"]
    cache_params = "_".join([f"{k}:{v}" for k,v in request.args.items() if k in params])
    
    cache_key = f"cache_{url}_{cache_params}"

    response = cache.get(cache_key)
    if response:
        return response 

    response = callback()

    cache.set(
        key = cache_key,
        value = response,
        expire = endpoint.cache["expiration"]
    )
    
    return response