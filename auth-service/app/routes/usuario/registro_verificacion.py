import logging
from common.utils.component_request import ComponentRequest
from flask import request, Blueprint
from app.database.session import SessionLocal
from app.services.usuario_service import UsuarioService
from common.decorators.api_access import api_access
from common.utils.response import make_response, ResponseStatus
import logging
from logging import getLogger

bp = Blueprint(
    "usuario_registro_verificacion", __name__, cli_group="usuario"
)
logger = logging.getLogger(__name__)
logger_local = getLogger("auth-service")
usuario_service = UsuarioService()

"""
Blueprint: usuario_registro_verificacion

Este módulo expone los endpoints relacionados al registro de nuevos usuarios
y la verificación de su dirección de email mediante código OTP.

Incluye:
- Inicio del registro de usuario (envío de OTP).
- Confirmación de registro mediante OTP.
- Reenvío del código OTP.

Utiliza `UsuarioService` para realizar la lógica de negocio y `make_response`
para estandarizar las respuestas. Usa `ComponentRequest` para extraer información
del cliente (como User-Agent) y aplica límites de uso por IP.
"""

# -----------------------------------------------------------------------------------------------------------------------------
# REGISTRO Y VERIFICACIÓN
# -----------------------------------------------------------------------------------------------------------------------------


@bp.route("/registro", methods=["POST"])
@api_access(
    is_public=True, 
    limiter=["15 per minute", "100 per hour"]
)
def iniciar_registro_usuario():
    """
    Inicia el proceso de registro de un nuevo usuario.

    Requiere:
        - JSON con datos del usuario (email obligatorio, nombre y password).

    Funcionalidad:
        - Llama a `UsuarioService.iniciar_registro`, que crea el usuario en estado no verificado.
        - Envía un código OTP por mail para verificar el email del usuario.

    Returns:
        - JSON con estado de la operación.
    """
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
    except Exception as e:
        logger_local.debug(f"Error al iniciar el registro: {str(e)}")
        session.rollback()
        return make_response(
            ResponseStatus.FAIL,
            "Error al iniciar el registro",
        ), 500
    finally:
        session.close()


@bp.route("/verificar-email", methods=["POST"])
@api_access(
    is_public=True, 
    limiter=["10 per minute , 50 per hour"], 

)
def confirmar_registro_usuario():
    """
    Confirma la cuenta de un usuario mediante un código OTP enviado al correo.

    Requiere:
        - JSON con:
            - "email_usuario" o "email"
            - "otp" (código de verificación)

    Funcionalidad:
        - Verifica que el código coincida con el último enviado.
        - Marca al usuario como "email verificado".
        - Crea un dispositivo confiable asociado al user-agent si corresponde.

    Returns:
        - JSON con estado de la operación.
    """

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
    """
    Reenvía el código OTP para verificación de correo si aún no fue verificado.

    Requiere:
        - JSON con:
            - "email_usuario" o "email"

    Funcionalidad:
        - Genera un nuevo OTP si el email existe y no está verificado.
        - Envía nuevamente el OTP por correo electrónico.

    Returns:
        - JSON con estado del reenvío.
    """
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