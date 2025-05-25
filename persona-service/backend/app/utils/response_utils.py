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
def make_response(status:ResponseStatus|str, message:str, data:Any = None)->Dict:
    response ={
        "status": status.value,
        "message": message or ""
    }

    if data is not None:
        response["data" if status!=ResponseStatus.ERROR else "error"]=data
        if isinstance(data, (list, set, tuple)):
            response["total"] = len(data)


    return jsonify(response)