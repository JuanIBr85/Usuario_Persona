import requests
from typing import Any


class ServiceRequest:
    """
    Clase que contiene metodos para hacer requests a microservicios
    esta pensado de forma tal de que nunca se olviden el timeout y que un request en espera indefinidamente
    """

    @staticmethod
    def request(method: str, url: str, timeout: int = 5, **kwargs: Any) -> requests.Response:
        """Request base"""
        return requests.request(method, url, timeout=timeout, **kwargs)

    @staticmethod
    def get(url: str, timeout: int = 5, **kwargs: Any) -> requests.Response:
        """Request GET"""
        return ServiceRequest.request("GET", url, timeout=timeout, **kwargs)
    
    @staticmethod
    def post(url: str, timeout: int = 5, **kwargs: Any) -> requests.Response:
        """Request POST"""
        return ServiceRequest.request("POST", url, timeout=timeout, **kwargs)
    
    @staticmethod
    def put(url: str, timeout: int = 5, **kwargs: Any) -> requests.Response:
        """Request PUT"""
        return ServiceRequest.request("PUT", url, timeout=timeout, **kwargs)
    
    @staticmethod
    def delete(url: str, timeout: int = 5, **kwargs: Any) -> requests.Response:
        """Request DELETE"""
        return ServiceRequest.request("DELETE", url, timeout=timeout, **kwargs)   