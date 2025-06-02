from flask import Blueprint, jsonify
from app.utils.respuestas import respuesta_estandar,RespuestaStatus
from app.constantes.tipos_documentos import TIPOS_DOCUMENTO_VALIDOS


opciones_bp = Blueprint("opciones_bp", __name__)

@opciones_bp.route("/tipos_documento", methods=["GET"])
def obtener_tipos_documento():
    return respuesta_estandar(
        status=RespuestaStatus.SUCCESS,
        message="Tipos de documento obtenidos correctamente",
        data=TIPOS_DOCUMENTO_VALIDOS
    ),200
