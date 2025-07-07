import time
from enum import Enum

"""
Clase que representa el log de un servicio
La funcion de esto es hacer un log mas limpio y sin tantos string 
"""

class EnumSuccess(str, Enum):
    """Enum para settear el estado del log"""
    IN_PROGRESS = "in_progress"
    SUCCESS = "success"
    ERROR = "error"
    NOT_AVAILABLE = "not_available"
    STOP = "stop"
    TIMEOUT = "timeout"


class ServiceEndpointLog:
    """Clase que representa el log de un servicio"""
    _progress:bool # Indica si la busqueda de endpoints esta en progreso
    success:EnumSuccess # Indica el estado de la busqueda de endpoints
    start_time:float # Tiempo de inicio
    end_time:float|None # Tiempo de finalización
    error:str|None # Error
    endpoints_count:int # Cantidad de endpoints
    service_name:str # Nombre del servicio

    def __init__(self, service_name:str):
        self.service_name = service_name
        self._progress = True
        self.success = EnumSuccess.IN_PROGRESS
        self.start_time = time.time()
        self.end_time = None
        self.error = None
        self.endpoints_count = 0
    
    def set_state(self, state:EnumSuccess):
        """Setea el estado de la busqueda de endpoints"""
        self.success = state
        self._progress = False
        self.end_time = time.time()

    def set_success(self, endpoints_count:int):
        """Setea el estado de la busqueda de endpoints como exitoso"""
        self.set_state(EnumSuccess.SUCCESS)
        self.endpoints_count = endpoints_count  
    
    def set_error(self, error:str):
        """Setea el estado de la busqueda de endpoints como error"""
        self.set_state(EnumSuccess.ERROR)
        self.error = error
    
    def set_not_available(self):
        """Setea el estado de la busqueda de endpoints como no disponible"""
        self.set_state(EnumSuccess.NOT_AVAILABLE)
    
    def set_stop(self):
        """Setea el estado de la busqueda de endpoints como detenido"""
        self.set_state(EnumSuccess.STOP)
    
    def set_timeout(self):
        """Setea el estado de la busqueda de endpoints como timeout"""
        self.set_state(EnumSuccess.TIMEOUT)
    
    def to_dict(self):
        """Devuelve el log como un diccionario"""
        return {
            "progress": self._progress,
            "success": self.success,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "error": self.error,
            "endpoints_count": self.endpoints_count,
            "service_name": self.service_name,
        }
    
        