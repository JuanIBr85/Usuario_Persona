from typing import Any, Dict
from enum import Enum
from typing import Any, Dict, Tuple, Union, Optional

from flask import jsonify

#Posibles status en las respuestas

class RespuestaStatus(Enum):
    SUCCESS = "success"
    FAIL = "fail"
    ERROR = "error"
    PENDING = "pending"
    UNAUTHORIZED = "unauthorized"
    NOT_FOUND = "not_found"


#Crear una respuesta estandar

def respuesta_estandar(status:RespuestaStatus, message:str, data:Any = None, error_code: Optional[str] = None)->Dict:
    
    """
    Crea una respuesta JSON estandarizada para ser utilizada en endpoints de una API.

    Args:
        status (RespuestaStatus): Estado de la respuesta (e.g., SUCCESS, ERROR).
        message (str): Mensaje descriptivo de la operación.
        data (Any, optional): Datos adicionales a incluir. Si es una colección, se incluye
                              el total de elementos. Si el estado es ERROR, se retorna bajo
                              la clave 'error'; de lo contrario, bajo la clave 'data'.
        error_code (str, optional): Código interno personalizado para manejo de errores en frontend.

    Returns:
        Dict: Diccionario JSON serializado con la estructura estándar de respuesta.
              Contiene los campos 'status', 'message', y opcionalmente 'data' o 'error' y 'total'.
    """

    #Estructura basica de respuesta

    if not isinstance(status, RespuestaStatus):
        raise TypeError("status debe de ser de tipo RespuestaStatus")

    respuesta={
        "status": status.value,  # Valor del estado (success, error, etc.)
        "message": message or ""  # Mensaje descriptivo o cadena vacía
    }


    if data is not None:
        respuesta["data" if status == RespuestaStatus.SUCCESS else "error"] = data

        if isinstance (data, (list, set, tuple)):  
            respuesta["total"] = len(data)

    if error_code:
        respuesta["error_code"] = error_code

    return respuesta        

