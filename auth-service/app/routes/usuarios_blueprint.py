from flask import Blueprint

usuario_bp = Blueprint("usuario", __name__)

"""
Blueprint: usuario

Este módulo agrupa todos los endpoints públicos relacionados al usuario:
- Inicio y cierre de sesión
- Registro y verificación por OTP
- Recuperación de contraseña

Incluye tres sub-blueprints:
- login_logout: gestión de sesiones
- recuperacion_pass_otp: manejo de OTP para recuperación de contraseña
- registro_verificacion: registro y validación de correo por OTP

Este módulo expone funcionalidades esenciales de autenticación de usuarios.
"""

from app.routes.usuario.login_logout import bp as login_logout_bp
from app.routes.usuario.recuperacion_pass_otp import bp as recuperacion_pass_otp_bp
from app.routes.usuario.registro_verificacion import bp as registro_verificacion_bp

usuario_bp.register_blueprint(login_logout_bp)
usuario_bp.register_blueprint(recuperacion_pass_otp_bp)
usuario_bp.register_blueprint(registro_verificacion_bp)

