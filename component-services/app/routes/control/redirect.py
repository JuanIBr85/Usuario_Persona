from flask import Blueprint
from common.utils.response import make_response, ResponseStatus
from app.services.services_search_service import ServicesSearchService
from app.decorators.cp_api_access import cp_api_access

bp = Blueprint("component", __name__, cli_group="control", url_prefix="/redirect")


@bp.route("/all", methods=["GET"])
@cp_api_access(is_public=True, limiter=["3 per minute"])
def all():
    try:
        return (
            make_response(
                ResponseStatus.SUCCESS,
                "Datos obtenidos correctamente",
                ServicesSearchService().get_redirect_list(),
            ),
            200,
        )
    except Exception as e:
        return (
            make_response(
                ResponseStatus.ERROR, "Hubo un error al obtener los datos", str(e)
            ),
            500,
        )


@bp.route("/update", methods=["GET"])
@cp_api_access(is_public=True, limiter=["10 per minute"])
def update():
    try:
        ServicesSearchService().update_redirect()
        return (
            make_response(
                ResponseStatus.SUCCESS,
                "Datos actualizados correctamente",
                ServicesSearchService().get_redirect_list(),
            ),
            200,
        )
    except Exception as e:
        return (
            make_response(
                ResponseStatus.ERROR, "Hubo un error al actualizar los datos", str(e)
            ),
            500,
        )


@bp.route(rule="/get/<string:code>", methods=["GET"])
@cp_api_access(is_public=True, limiter=["10 per minute"])
def get(code: str):
    try:
        redirect = ServicesSearchService().get_redirect(code)
        if redirect is None:
            return (
                make_response(ResponseStatus.NOT_FOUND, "Redireccion no encontrada"),
                404,
            )
        return (
            make_response(
                ResponseStatus.SUCCESS,
                "Datos obtenidos correctamente",
                redirect,
            ),
            200,
        )
    except Exception as e:
        return (
            make_response(
                ResponseStatus.ERROR, "Hubo un error al obtener los datos", str(e)
            ),
            500,
        )
