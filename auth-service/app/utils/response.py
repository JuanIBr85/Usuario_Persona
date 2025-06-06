from typing import Any, Dict
from enum import Enum
from typing import Any, Dict, Tuple, Union, Optional
from flask import jsonify,Flask
from werkzeug.exceptions import HTTPException


# Enum con los posibles estados de una respuesta
class ResponseStatus(Enum):
    SUCCESS = "success"                 # Operación exitosa
    FAIL = "fail"                       # Fallo controlado (input inválido, datos no encontrados)
    ERROR = "error"                     # Error inesperado (excepciones, fallos internos)
    PENDING = "pending"                 # Operación en curso o pendiente
    UNAUTHORIZED = "unauthorized"       # Falta de autenticación/autorización
    NOT_FOUND = "not_found"             # Recurso no encontrado


# Función para construir una respuesta JSON estandarizada
def make_response(
    status: ResponseStatus,
    message: str,
    data: Any = None,
    error_code: Optional[str] = None
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
    response = {
        "status": status.value,
        "message": message or ""
    }

    if data is not None:
        key = "data" if status != ResponseStatus.SUCCESS else "error"
        response[key] = data
        if isinstance(data, (list, set, tuple)):
            response["total"] = len(data)

    if error_code:
        response["error_code"] = error_code

    if not isinstance(status, ResponseStatus):
        raise TypeError("El primer elemento de la tupla debe ser ResponseStatus")

    return jsonify(response)


# Función para construir y devolver una respuesta Flask completa
def build_response(
    result: Union[
        Tuple[ResponseStatus, str, Any],
        Tuple[ResponseStatus, str, Any, int],
        Tuple[ResponseStatus, str, Any, int, Optional[str]]
    ]
):
    """
    Construye una respuesta en Flask a partir de una tupla devuelta por servicio.

    Soporta tres formatos:
    - (status, message, data)
    - (status, message, data, http_code)
    - (status, message, data, http_code, error_code)

    Retorna:
        (jsonify(...), http_status_code)
    """

    
    if len(result) == 5:
        status, message, data, http_code, error_code = result
    elif len(result) == 4:
        status, message, data, http_code = result
        error_code = None
    elif len(result) == 3:
        status, message, data = result
        http_code = 200 if status == ResponseStatus.SUCCESS else 400
        error_code = None
    else:
        raise ValueError("Formato de retorno del servicio inválido")
    
    if not isinstance(status, ResponseStatus):
        raise TypeError("El primer elemento de la tupla debe ser ResponseStatus")

    return make_response(status, message, data, error_code), http_code



def register_error_handlers(app: Flask):
    """
    Registra un manejador global de errores para capturar todas las excepciones no controladas
    y retornar una respuesta uniforme en formato JSON.
    """

    @app.errorhandler(Exception)
    def handle_global_exception(e):
        """
        Captura cualquier excepción no gestionada previamente por una ruta o servicio.

        Si es una excepción HTTP (como 404 o 401), utiliza su código y descripción.
        Si es un error interno, se captura como error 500 con un mensaje genérico.
        """

        # Si es una excepción HTTP conocida (por ejemplo, 404 Not Found, 401 Unauthorized, etc.)
        if isinstance(e, HTTPException):
            return build_response((
                ResponseStatus.ERROR,
                e.description,     # Mensaje estándar de la excepción HTTP
                None,              # No enviamos data
                e.code,            # Código HTTP real
                e.code             # También lo usamos como código interno
            ))

        # Para cualquier otro error no esperado (por ejemplo, errores de lógica, división por cero, etc.)
        return build_response((
            ResponseStatus.ERROR,
            "Error interno del servidor",   # Mensaje genérico
            str(e),                         # Incluye el traceback como string (útil en desarrollo)
            500,                            # Código HTTP 500
            5000                            # Código interno personalizado
        ))