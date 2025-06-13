from flask import request, g
import requests

def request_to_service(url):
    #se remueven los parametros de los headers, para evitar errores
    headers = {key: value for key, value in request.headers if key.upper() not in [
            "HOST", 
            "ACCEPT-ENCODING",
            "CONNECTION",
            "CONTENT-LENGTH",
            "TRANSFER-ENCODING",
            "KEEP-ALIVE",
            "X-USER-ID"
    ]}

    #Si tiene el token, lo agrego a los headers
    if hasattr(g, "jwt"):
        #Guardo el id del usuario en X-USER-ID en el header
        headers["X-USER-ID"] = g.jwt["sub"]

    #Armo la request para enviar al microservicio con todos los datos recibidos
    #Envio la request al microservicio
    response = requests.request(method=request.method, **{
        "url":url,
        "headers": headers,
        "params":request.args,
        "json":request.get_json() if request.is_json else None,
        "data":request.form if not request.is_json else None
    })

    # Filtrar headers que Flask no debe reenviar
    excluded_headers = ['content-encoding', 'content-length', 'transfer-encoding', 'connection']
    response_headers = {
        key: value for key, value in response.headers.items() 
        if key.lower() not in excluded_headers
    }

    return {
        "response":response.content,
        "status":response.status_code,
        "headers":response_headers,
        "mimetype":response.headers.get('content-type')
    }
