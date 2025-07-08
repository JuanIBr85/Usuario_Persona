
from functools import wraps
from flask import Flask, jsonify, request, g, make_response
from app.utils.cache_util import cache_response

app = Flask(__name__)

def cache_decorator(f):
    @wraps(f)
    def decorador(*args, **kwargs):

        def response_callback():
            # Convertir a Response si no lo es
            response = make_response(f(*args, **kwargs))
            
            # Cachear data y headers por separado
            return {
                'data': response.get_data(),
                'headers': dict(response.headers)
            }


        result = cache_response(
            response_callback,
            request.path,
            f._security_metadata
        )

        response = make_response(result['data'])
        response.headers.update(result['headers'])

        # Retornar la misma salida
        return response
    return decorador