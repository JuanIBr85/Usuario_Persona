import json
import traceback
from flask import render_template
from app.schemas.usuarios_schema import UsuarioModificarSchema
from marshmallow import ValidationError
from common.utils.component_request import ComponentRequest
import jwt
from os import getenv
from flask import request, Blueprint, Response
from app.database.session import SessionLocal
from app.services.usuario_service import UsuarioService
from app.extensions import limiter
from app.utils.jwt import verificar_token_reset,verificar_token_restauracion_usuario
from jwt import ExpiredSignatureError, InvalidTokenError
from app.utils.email import decodificar_token_verificacion, generar_token_dispositivo
from app.models.usuarios import Usuario
from app.models.dispositivos_confiable import DispositivoConfiable
from datetime import datetime, timezone, timedelta
from common.decorators.api_access import api_access
from common.models.cache_settings import CacheSettings
from common.utils.response import make_response, ResponseStatus

bp = Blueprint(
    "usuario_registro_verificacion", __name__, cli_group="usuario"
)

usuario_service = UsuarioService()

# -----------------------------------------------------------------------------------------------------------------------------
# REGISTRO Y VERIFICACIÓN
# -----------------------------------------------------------------------------------------------------------------------------


@bp.route("/registro", methods=["POST"])
@api_access(
    is_public=True, 
    limiter=["15 per minute", "100 per hour"]
)
def iniciar_registro_usuario():
    data = request.get_json()
    if not data:
        return make_response(
            ResponseStatus.FAIL, "Datos requeridos", error_code="NO_INPUT"
        )

    session = SessionLocal()
    try:
        status, mensaje, contenido, codigo = usuario_service.iniciar_registro(
            session, data
        )
        return make_response(status, mensaje, contenido), codigo
    finally:
        session.close()


@bp.route("/verificar-email", methods=["POST"])
@api_access(
    is_public=True, 
    limiter=["10 per minute , 50 per hour"], 

)
def confirmar_registro_usuario():
    data = request.get_json()
    email = data.get("email_usuario")
    otp = data.get("otp")
    user_agent = ComponentRequest.get_user_agent()
    if not email or not otp:
        return (
            make_response(
                ResponseStatus.FAIL,
                "Email y OTP son requeridos",
                error_code="OTP_REQUIRED",
            ),
            400,
        )

    session = SessionLocal()
    try:
        status, mensaje, contenido, codigo = usuario_service.confirmar_registro(
            session, email, otp, user_agent or ""
        )
        return make_response(status, mensaje, contenido), codigo
    finally:
        session.close()

@bp.route("/resend-otp", methods=["POST"])
@api_access(is_public=True, limiter=["10 per minute"])
def reenviar_otp_registro():
    data = request.get_json()
    email = data.get("email_usuario") or data.get("email")
    
    if not email:
        return make_response(ResponseStatus.FAIL, "Email requerido", None, 400)
    session = SessionLocal()
    try:
        status, mensaje, contenido, codigo = usuario_service.reenviar_otp_registro(
            session, email
        )
        return make_response(status, mensaje, contenido), codigo
    finally:
        session.close()