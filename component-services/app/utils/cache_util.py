from typing import Callable
from app.extensions import cache
from common.models.endpoint_route_model import EndpointRouteModel
from flask import request

def cache_response(callback:Callable, url:str, endpoint:EndpointRouteModel):
    cache_params = ""

    params = endpoint.cache["params"]
    cache_params = "_".join([f"{k}:{v}" for k,v in request.args.items() if k in params])
    response = cache.get(f"{url}_{cache_params}")
    if response:
        return response 

    response = callback()

    cache.set(
        key = f"{url}_{cache_params}",
        value = response,
        expire = endpoint.cache["expiration"]
    )
    
    return response