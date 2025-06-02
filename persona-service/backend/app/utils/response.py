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
    # Crear la estructura básica de la respuesta
    response = {
        "status": status.value,  # Valor del estado (success, error, etc.)
        "message": message or ""  # Mensaje descriptivo o cadena vacía
    }

    # Si hay datos para incluir en la respuesta
    if data is not None:
        # Usar 'data' para respuestas exitosas o 'error' para errores
        response["data" if status != ResponseStatus.ERROR else "error"] = data
        
        # Si los datos son una colección
        if isinstance(data, (list, set, tuple)):
            # Agrega el total de elementos
            response["total"] = len(data)

    # Convertir el diccionario a formato JSON
    return jsonify(response)