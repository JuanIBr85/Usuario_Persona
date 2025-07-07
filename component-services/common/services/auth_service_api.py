import os
from common.services.service_request import ServiceRequest


AUTH_SERVICE_HOST = os.environ.get(
    "AUTH_SERVICE_HOST", "localhost"
)
AUTH_SERVICE_URL = f"http://{AUTH_SERVICE_HOST}:5000"

class AuthServiceApi:

    @staticmethod
    def _request_to(path:str, method:str="GET", data=None, json=None, headers=None):
        return ServiceRequest.request(method, f"{AUTH_SERVICE_URL}/{path}", data=data, json=json, headers=headers)

    @staticmethod
    def permisos():
        return AuthServiceApi._request_to("permisos", "GET")