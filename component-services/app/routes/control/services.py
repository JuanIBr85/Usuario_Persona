import threading
from flask import Blueprint
from flask import request, jsonify
from app.decorators.cp_api_access import cp_api_access
from app.services.servicio_base import ServicioBase
from common.utils.response import make_response, ResponseStatus
from app.models.service_model import ServiceModel
from app.schemas.service_schema import ServiceSchema
from app.utils.get_health import get_health
from app.utils.get_component_info import get_component_info
from datetime import datetime, timezone, timedelta
from flask import current_app
import time
from app.utils.redis_message import send_event
from app.services.event_service import EventService

bp = Blueprint("services", __name__, cli_group="control", url_prefix="/services")
services_service: ServicioBase = ServicioBase(ServiceModel, ServiceSchema())


event_service: EventService = EventService()


@bp.route("/echo", methods=["GET"])
@cp_api_access(is_public=True)
def echo():
    send_event("test", {"message": "Bienvenido a la API de Componentes"})
    return jsonify({"message": "Bienvenido a la API de Componentes"}), 200


@bp.route("/all", methods=["GET"])
@cp_api_access(is_public=True, limiter=["15 per minute"])
def get_services():
    try:
        services = services_service.get_all()
        for service in services:
            service["health"] = get_health(service["service_url"])
        return (
            make_response(
                ResponseStatus.SUCCESS, "Servicios obtenidos correctamente", services
            ),
            200,
        )
    except Exception as e:
        return make_response(ResponseStatus.ERROR, str(e)), 500


@bp.route("/get_service/<int:id>", methods=["GET"])
@cp_api_access(is_public=True, limiter=["15 per minute"])
def get_service(id: int):
    try:
        service = services_service.get_by_id(id)
        if service is None:
            return make_response(ResponseStatus.FAIL, "Servicio no encontrado"), 404

        service["health"] = get_health(service["service_url"])
        return (
            make_response(
                ResponseStatus.SUCCESS, "Servicio obtenido correctamente", service
            ),
            200,
        )
    except Exception as e:
        return make_response(ResponseStatus.ERROR, str(e)), 500


@bp.route("/refresh_service/<int:id>", methods=["PUT"])
@cp_api_access(is_public=True, limiter=["5 per minute"])
def refresh_service(id: int):
    try:
        service: ServiceModel = services_service.get_by_id(id)

        if service is None:
            return make_response(ResponseStatus.FAIL, "Servicio no encontrado"), 404

        info = get_component_info(service["service_url"], wait=True)

        if info is None:
            return (
                make_response(ResponseStatus.FAIL, "Error al conectar con el servicio"),
                400,
            )

        model = {**info["service"], "service_url": service["service_url"]}

        services_service.update(id, model, ignore_schema=True)

        return (
            make_response(
                ResponseStatus.SUCCESS, "Servicio actualizado correctamente", model
            ),
            200,
        )
    except Exception as e:
        return make_response(ResponseStatus.ERROR, str(e)), 500


@bp.route("/install_service", methods=["POST"])
@cp_api_access(is_public=True, limiter=["5 per minute"])
def install_service():
    try:
        url = request.get_json().get("url")

        info = get_component_info(url, wait=False)
        if info is None:
            return (
                make_response(ResponseStatus.FAIL, "Error al conectar con el servicio"),
                400,
            )

        model = {**info["service"], "service_url": url}

        _model = services_service.query(
            lambda session: session.filter_by(
                service_name=model["service_name"]
            ).first(),
            not_dump=True,
        )

        if _model is not None:
            return (
                make_response(ResponseStatus.FAIL, "El servicio ya existe"),
                400,
            )

        services_service.create(model, ignore_schema=True)

        return (
            make_response(
                ResponseStatus.SUCCESS, "Servicio instalado correctamente", model
            ),
            200,
        )
    except Exception as e:
        return make_response(ResponseStatus.ERROR, str(e)), 500


@bp.route("/remove_service/<int:id>", methods=["DELETE"])
@cp_api_access(is_public=True, limiter=["5 per minute"])
def remove_service(id: int):
    try:

        service: ServiceModel = services_service.get_by_id(id)

        if service is None:
            return make_response(ResponseStatus.FAIL, "Servicio no encontrado"), 404

        if service["service_core"] is True:
            return (
                make_response(
                    ResponseStatus.FAIL, "No se puede eliminar un servicio core"
                ),
                400,
            )

        services_service.delete(id, soft=False)

        return (
            make_response(ResponseStatus.SUCCESS, "Servicio removido correctamente"),
            200,
        )
    except Exception as e:
        return make_response(ResponseStatus.ERROR, str(e)), 500


@bp.route("/set_service_available/<int:id>/<int:state>", methods=["PUT"])
@cp_api_access(is_public=True, limiter=["5 per minute"])
def set_service_available(id: int, state: int):
    try:
        service: ServiceModel = services_service.get_by_id(id)

        if service is None:
            return make_response(ResponseStatus.FAIL, "Servicio no encontrado"), 404

        if service["service_wait"] is True:
            return (
                make_response(
                    ResponseStatus.FAIL,
                    "El servicio es requerido por el servicio de componentes, no puede ser desactivado",
                ),
                400,
            )

        services_service.update(
            id, {"id_service": service["id_service"], "service_available": state == 1}
        )

        return (
            make_response(
                ResponseStatus.SUCCESS, "Servicio actualizado correctamente", service
            ),
            200,
        )
    except Exception as e:
        return make_response(ResponseStatus.ERROR, str(e)), 500


@bp.route("/stop_system", methods=["POST"])
@cp_api_access(is_public=True, limiter=["1 per minute"])
def stop_system():
    try:

        def stop():
            time.sleep(30)
            # EventService.send_stop_event()
            # Limpia todas las rutas
            send_event("stop_services", {})

        # Envio un evento para indicar que el servicio de componentes se va a parar
        event_service.component_stop_service()
        threading.Thread(target=stop).start()

        return (
            make_response(
                ResponseStatus.SUCCESS,
                {
                    "message": "Sistema se desconectaran en 30 segundos, una vez detenido espere unos segundos para asegurarse de que los servicios no esten interactuando con la base de datos",
                    "time": datetime.now(timezone.utc) + timedelta(seconds=30),
                },
            ),
            200,
        )
    except Exception as e:
        return make_response(ResponseStatus.ERROR, str(e)), 500
