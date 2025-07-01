from typing import Any, Dict
from enum import Enum
from typing import Any, Dict, Tuple, Union, Optional
from flask import jsonify, Flask
from werkzeug.exceptions import HTTPException


# Enum con los posibles estados de una respuesta
class ResponseStatus(Enum):
    SUCCESS = "success"  # Operación exitosa
    FAIL = "fail"  # Fallo controlado (input inválido, datos no encontrados)
    ERROR = "error"  # Error inesperado (excepciones, fallos internos)
    PENDING = "pending"  # Operación en curso o pendiente
    UNAUTHORIZED = "unauthorized"  # Falta de autenticación/autorización
    NOT_FOUND = "not_found"  # Recurso no encontrado


# Función para construir una respuesta JSON estandarizada
def make_response(
    status: ResponseStatus,
    message: str,
    data: Any = None,
    error_code: Optional[str] = None,
) -> Dict:
    """
    Crea una respuesta JSON estandarizada para ser utilizada en endpoints de una API.

    Args:
        status (ResponseStatus): Estado de la respuesta (SUCCESS, FAIL, etc.).
        message (str): Mensaje descriptivo de la operación.
        data (Any, optional): Datos o errores adicionales. Si es una colección, se incluye 'total'.
        error_code (str, optional): Código interno personalizado para manejo de errores en frontend.

    Returns:
        Dict: Objeto JSON serializado con estructura estándar:
              {
                  "status": "fail",
                  "message": "Correo inválido",
                  "data": { ... },
                  "error_code": "EMAIL_NOT_FOUND"
              }
    """

    if not isinstance(status, ResponseStatus):
        raise TypeError("status debe de ser de tipo ResponseStatus")

    response = {"status": status.value, "message": message or ""}

    if data is not None:
        key = "data" if status == ResponseStatus.SUCCESS else "error"
        response[key] = data
        if isinstance(data, (list, set, tuple)):
            response["total"] = len(data)

    if error_code:
        response["error_code"] = error_code

    return jsonify(response)

