from flask import Blueprint

usuario_bp = Blueprint("usuario", __name__)

from app.routes.usuario.login_logout import bp as login_logout_bp
from app.routes.usuario.recuperacion_pass_otp import bp as recuperacion_pass_otp_bp
from app.routes.usuario.registro_verificacion import bp as registro_verificacion_bp

usuario_bp.register_blueprint(login_logout_bp)
usuario_bp.register_blueprint(recuperacion_pass_otp_bp)
usuario_bp.register_blueprint(registro_verificacion_bp)

