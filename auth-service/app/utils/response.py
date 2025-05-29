from typing import Any, Dict
from enum import Enum

from flask import jsonify

#Enum con los posibles status de las respuestas
class ResponseStatus(Enum):
    SUCCESS = "success"
    FAIL = "fail"
    ERROR = "error"
    PENDING = "pending"
    UNAUTHORIZED = "unauthorized"
    NOT_FOUND = "not_found"

#Metodo para crear una respuesta estandar
def make_response(status:ResponseStatus, message:str, data:Any = None)->Dict:
    """
    Crea una respuesta JSON estandarizada para ser utilizada en endpoints de una API.

    Args:
        status (ResponseStatus): Estado de la respuesta (e.g., SUCCESS, ERROR).
        message (str): Mensaje descriptivo de la operación.
        data (Any, optional): Datos adicionales a incluir. Si es una colección, se incluye
                              el total de elementos. Si el estado es ERROR, se retorna bajo
                              la clave 'error'; de lo contrario, bajo la clave 'data'.

    Returns:
        Dict: Diccionario JSON serializado con la estructura estándar de respuesta.
              Contiene los campos 'status', 'message', y opcionalmente 'data' o 'error' y 'total'.
    """
    response ={
        "status": status.value,
        "message": message or ""
    }

    if data is not None:
        response["data" if status!=ResponseStatus.ERROR else "error"]=data
        if isinstance(data, (list, set, tuple)):
            response["total"] = len(data)


    return jsonify(response)