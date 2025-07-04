import time

from enum import Enum

class EnumSuccess(str, Enum):
    IN_PROGRESS = "in_progress"
    SUCCESS = "success"
    ERROR = "error"
    NOT_AVAILABLE = "not_available"
    STOP = "stop"
    TIMEOUT = "timeout"


class ServiceEndpointLog:
    """Clase que representa el log de un servicio"""
    _progress:bool
    success:EnumSuccess
    start_time:float
    end_time:float|None
    error:str|None
    endpoints_count:int
    service_name:str

    def __init__(self, service_name:str):
        self.service_name = service_name
        self._progress = True
        self.success = EnumSuccess.IN_PROGRESS
        self.start_time = time.time()
        self.end_time = None
        self.error = None
        self.endpoints_count = 0
    
    def set_state(self, state:EnumSuccess):
        """Setea el estado del servicio"""
        self.success = state
        self._progress = False
        self.end_time = time.time()

    def set_success(self, endpoints_count:int):
        self.set_state(EnumSuccess.SUCCESS)
        self.endpoints_count = endpoints_count  
    
    def set_error(self, error:str):
        self.set_state(EnumSuccess.ERROR)
        self.error = error
    
    def set_not_available(self):
        self.set_state(EnumSuccess.NOT_AVAILABLE)
    
    def set_stop(self):
        self.set_state(EnumSuccess.STOP)
    
    def set_timeout(self):
        self.set_state(EnumSuccess.TIMEOUT)
    

    def to_dict(self):
        return {
            "progress": self._progress,
            "success": self.success,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "error": self.error,
            "endpoints_count": self.endpoints_count,
            "service_name": self.service_name,
        }
    
        