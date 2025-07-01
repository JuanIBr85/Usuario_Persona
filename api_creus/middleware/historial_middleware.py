from flask import request, g
from datetime import datetime
from zoneinfo import ZoneInfo
from models import db
from models.historial_model import Historial

def register_historial_middleware(app):
    @app.before_request
    def before():
        g.start_time = datetime.now(ZoneInfo("America/Argentina/Buenos_Aires"))

    @app.after_request
    def after(response):
        g.status_code = response.status_code
        g.response_json = response.get_json(silent=True)
        return response

    @app.teardown_request
    def teardown(error):
        if request.method not in ['POST', 'PUT', 'DELETE']:
            return

        try:

            path_parts = [p for p in request.path.split('/') if p]

            #Nombre de tabla sin usar ID
            if len(path_parts) >= 2 and path_parts[0] == 'api':
                if path_parts[-1].isdigit():
                    nombre_tabla = path_parts[-2].replace('-', '_')
                else:
                    nombre_tabla = path_parts[-1].replace('-', '_')
            else:
                nombre_tabla = 'desconocida'

            accion = request.method
            id_usuario = getattr(g, 'user_id', None)

            #Extraer ID de varias formas
            id_registro = None
            data = getattr(g, 'response_json', None)

            if data:
                if isinstance(data.get("data"), dict):
                    id_registro = data["data"].get("id")
                elif isinstance(data.get("data"), int):
                    id_registro = data.get("data")

            if id_registro is None and path_parts and path_parts[-1].isdigit():
                id_registro = int(path_parts[-1])

            status = getattr(g, 'status_code', 'unknown')
            estado_logico = data.get('status', 'success') if data else 'success'

            #Campos enviados (POST o PUT)
            texto_cambios = ""
            if request.method in ['POST', 'PUT']:
                payload = request.get_json(silent=True)
                if payload:
                    texto_cambios = " | Campos enviados: " + "; ".join(
                        f"{k}={v}" for k, v in payload.items()
                    )
            observaciones = (
                f'Path: {request.path} | '
                f'HTTP Status: {status} | '
                f'Lógico: {estado_logico} | '
                f'Error: {data.get("error") if estado_logico != "success" else "None"}'
                f'{texto_cambios}'
            )

            historial = Historial(
                id_registro=id_registro,
                nombre_tabla=nombre_tabla,
                fecha_hora=datetime.now(ZoneInfo("America/Argentina/Buenos_Aires")),
                accion=accion,
                id_usuario=id_usuario,
                observaciones=observaciones
            )

            db.session.add(historial)
            db.session.commit()
        except Exception as e:
            app.logger.warning(f"No se pudo registrar historial (teardown): {str(e)}")