import threading
import traceback
from flask import Blueprint
from flask import request
from app.decorators.cp_api_access import cp_api_access
from app.services.servicio_base import ServicioBase
from common.utils.response import make_response, ResponseStatus
from app.models.service_model import ServiceModel
from app.schemas.service_schema import ServiceSchema
from app.services.services_serch_service import ServicesSearchService
from app.extensions import logger


bp = Blueprint(
    "services_internal", __name__, cli_group="internal", url_prefix="/services"
)
services_service: ServicioBase = ServicioBase(ServiceModel, ServiceSchema())


@bp.route("/recolect_perms", methods=["GET"])
def recolect_perms():
    try:
        perms = ServicesSearchService().get_permissions()
        return (
            make_response(
                ResponseStatus.SUCCESS, "Permisos recolectados correctamente", perms
            ),
            200,
        )
    except Exception as e:
        traceback.print_exc()
        return make_response(ResponseStatus.ERROR, str(e)), 500
