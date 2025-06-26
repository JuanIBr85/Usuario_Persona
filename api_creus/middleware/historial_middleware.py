from flask import request, g
from datetime import datetime
from models import db
from zoneinfo import ZoneInfo
from models.historial_model import Historial

def register_historial_middleware(app):
    @app.before_request
    def before():
        g.start_time = datetime.now(ZoneInfo("America/Argentina/Buenos_Aires"))

    

    @app.after_request
    def after(response):
        #Guarda el status y el json
        g.status_code = response.status_code
        g.response_json = response.get_json(silent=True)
        return response

    @app.teardown_request
    def teardown(error):
        if request.method not in ['POST', 'PUT', 'DELETE']:
            return
        try:
            # Dividir path para analizarlo
            path_parts = [p for p in request.path.split('/') if p]

            # Determinar nombre de tabla
            if len(path_parts) >= 3 and path_parts[0] == 'api':
                nombre_tabla = path_parts[2].replace('-', '_')
            elif len(path_parts) >= 2:
                nombre_tabla = path_parts[1].replace('-', '_')
            else:
                nombre_tabla = 'desconocida'

            accion = request.method
            id_usuario = getattr(g, 'user_id', None)

            # 1. Intentar extraer ID del JSON del response
            id_registro = None
            data = getattr(g, 'response_json', None)
            if data and isinstance(data.get("data"), dict):
                id_registro = data["data"].get("id")

            # 2. Si no vino por JSON, intentar desde la URL
            if id_registro is None and len(path_parts) >= 1 and path_parts[-1].isdigit():
                id_registro = int(path_parts[-1])

            # Obtener status code si existe
            status = getattr(g, 'status_code', 'unknown')

            #Detectar el estado
            estado_logico = 'success'
            if data:
                estado_logico = data.get('status', 'success')

            historial = Historial(
                id_registro=id_registro,
                nombre_tabla=nombre_tabla,
                fecha_hora=datetime.now(ZoneInfo("America/Argentina/Buenos_Aires")),
                accion=accion,
                id_usuario=id_usuario,
                    observaciones=(
                        f'Path: {request.path} | HTTP Status: {status} | '
                        f'Lógico: {estado_logico} | '
                        f'Error: {data.get("error") if estado_logico != "success" else "None"}'
                    )
            )

            db.session.add(historial)
            db.session.commit()

        except Exception as e:
            app.logger.warning(f"No se pudo registrar historial (teardown): {str(e)}")