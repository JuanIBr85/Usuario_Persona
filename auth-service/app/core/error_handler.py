import logging
import traceback
from flask import jsonify

def registrar_manejador_errores(app):

    #@app.errorhandler(Exception)
    def manejar_error_global(e):
        logger = logging.getLogger()
        trace = "".join(traceback.format_exception(type(e), e, e.__traceback__))
        logger.error(f"Excepción no manejada:\n{trace}")

        return jsonify({
            "status": "error",
            "message": "Error interno del servidor",
            "data": None
        }), 500