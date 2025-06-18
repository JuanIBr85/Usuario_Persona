import threading
from flask import Blueprint
from flask import request
from app.decorators.cp_api_access import cp_api_access
from app.services.servicio_base import ServicioBase
from common.utils.response import make_response, ResponseStatus
from app.models.service_model import ServiceModel
from app.schemas.service_schema import ServiceSchema

bp = Blueprint("services", __name__, cli_group="control", url_prefix="/services")
services_service: ServicioBase = ServicioBase(ServiceModel, ServiceSchema())


@bp.route("/all", methods=["GET"])
@cp_api_access(is_public=True, limiter=["5 per minute"])
def get_services():
    try:
        services = services_service.get_all()
        return (
            make_response(
                ResponseStatus.SUCCESS, "Servicios obtenidos correctamente", services
            ),
            200,
        )
    except Exception as e:
        return make_response(ResponseStatus.ERROR, str(e)), 500


@bp.route("/get_service/<int:id>", methods=["GET"])
@cp_api_access(is_public=True, limiter=["5 per minute"])
def get_service(id: int):
    try:
        service = services_service.get_by_id(id)

        if service is None:
            return make_response(ResponseStatus.FAIL, "Servicio no encontrado"), 404

        return (
            make_response(
                ResponseStatus.SUCCESS, "Servicio obtenido correctamente", service
            ),
            200,
        )
    except Exception as e:
        return make_response(ResponseStatus.ERROR, str(e)), 500


@bp.route("/add_service", methods=["POST"])
@cp_api_access(is_public=True, limiter=["5 per minute"])
def add_service():
    try:
        data = request.get_json()

        valid, errors = services_service.validate(data)
        if not valid:
            return make_response(ResponseStatus.FAIL, "Datos invalidos", errors), 400

        model = services_service.create(data)
        return (
            make_response(
                ResponseStatus.SUCCESS, "Servicio agregado correctamente", model
            ),
            200,
        )
    except Exception as e:
        if "IntegrityError" in str(e):
            return (
                make_response(
                    ResponseStatus.FAIL,
                    "Error: el servicio ya existe en la base de datos",
                ),
                400,
            )
        return make_response(ResponseStatus.ERROR, str(e)), 500


@bp.route("/delete_service/<int:id>", methods=["DELETE"])
@cp_api_access(is_public=True, limiter=["5 per minute"])
def delete_service(id: int):
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

        services_service.delete(id)

        return (
            make_response(
                ResponseStatus.SUCCESS, "Servicio eliminado correctamente", service
            ),
            200,
        )
    except Exception as e:
        return make_response(ResponseStatus.ERROR, str(e)), 500


@bp.route("/update_service/<int:id>", methods=["PUT"])
@cp_api_access(is_public=True, limiter=["5 per minute"])
def update_service(id: int):
    try:
        data = request.get_json()

        valid, errors = services_service.validate(data)
        if not valid:
            return make_response(ResponseStatus.FAIL, "Datos invalidos", errors), 400

        if not services_service.exist(id):
            return make_response(ResponseStatus.FAIL, "Servicio no encontrado"), 404

        model = services_service.update(id, data)
        return (
            make_response(
                ResponseStatus.SUCCESS, "Servicio actualizado correctamente", model
            ),
            200,
        )
    except Exception as e:
        return make_response(ResponseStatus.ERROR, str(e)), 500
