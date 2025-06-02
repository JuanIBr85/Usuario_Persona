from flask import Blueprint, jsonify
from app.constantes.tipos_documentos import TIPOS_DOCUMENTO_VALIDOS
from app.utils.response import make_response, ResponseStatus


opciones_bp = Blueprint("opciones_bp", __name__)

@opciones_bp.route("/tipos_documento", methods=["GET"])
def obtener_tipos_documento():
    return make_response(
        status=ResponseStatus.SUCCESS, 
        message="Tipos de documento obtenidos correctamente", 
        data=TIPOS_DOCUMENTO_VALIDOS
    ), 200