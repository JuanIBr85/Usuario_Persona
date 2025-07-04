import json
import traceback
from flask import render_template_string
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

usuario_bp = Blueprint("usuario", __name__)


from app.routes.usuario.login_logout import bp as login_logout_bp
from app.routes.usuario.recuperacion_pass_otp import bp as recuperacion_pass_otp_bp
from app.routes.usuario.registro_verificacion import bp as registro_verificacion_bp

usuario_bp.register_blueprint(login_logout_bp)
usuario_bp.register_blueprint(recuperacion_pass_otp_bp)
usuario_bp.register_blueprint(registro_verificacion_bp)

