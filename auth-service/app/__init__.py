from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os
import logging
import time
# Estos paquetes vienen del modulo common del servicio de componentes
from common.decorators.receiver import receiver
from common.utils.component_service import component_service
from common.services.send_message_service import send_message
from common.decorators.api_access import api_access
from common.services.component_service_api import ComponentServiceApi

from app.script.reset_db import crear_base, eliminar_base
from app.script.seed_data import seed
from app.routes.usuarios_blueprint import usuario_bp
from app.routes.superadmin_blueprint import superadmin_bp
from app.routes.admin_microservicios_blueprint import admin_micro_bp
from app.extensions import mail
import smtplib
from app.utils.actualizar_roles_permisos import actualizar_roles

from app.core.logging_config import configurar_logger_global
from app.core.error_handler import registrar_manejador_errores
logger = logging.getLogger(__name__)
from app.routes.debug_routes import debug_bp

def create_app():
    #monkey patch para no lanzar el log de mails.
    smtplib.SMTP.set_debuglevel = lambda self, level: None
    load_dotenv()
    app_flask = Flask(__name__)
    app_flask.config.from_object("config.Config")

    # inicializo extensiones
    mail.init_app(app_flask)
    JWTManager(app_flask)

    component_service(app_flask)
    # registro blueprints
    app_flask.register_blueprint(superadmin_bp, url_prefix="/super-admin")
    app_flask.register_blueprint(admin_micro_bp, url_prefix="/admin-micro")
    app_flask.register_blueprint(usuario_bp)
    app_flask.register_blueprint(debug_bp)
    #logger general para excepciones no manejadas
    configurar_logger_global()
    registrar_manejador_errores(app_flask)


    if os.environ.get("WERKZEUG_RUN_MAIN") != "true":
        init_app()

    # ruta raíz
    @api_access(is_public=True)
    @app_flask.route("/")
    def index():
        print(request.headers)
        output = []
        for rule in app_flask.url_map.iter_rules():
            if rule.endpoint == "static":
                continue
            methods = sorted(rule.methods - {"HEAD", "OPTIONS"})
            output.append(
                {
                    "endpoint": rule.endpoint,
                    "methods": ", ".join(methods),
                    "rule": str(rule),
                }
            )
        return jsonify(output)

    return app_flask


def init_app():
    FORZAR_RESET = True
    if FORZAR_RESET:
        print("[i] Reiniciando base de datos y datos del seed...")
        eliminar_base()
        crear_base()
        seed()

    else:
        print("[✓] Base de datos ya existente. No se reinicia.")





@receiver(channel="default")
def funcion_que_recibe_mensajes(message: dict, app_flask: Flask) -> None:
    logger.warning(f"Mensaje recibido: {message}")
    event_type = message.get("event_type")
    logger.warning(f"Mensaje completo recibido: {message}")
    if event_type in ("gateway-research", "component-start-service"):
        with app_flask.app_context():
            time.sleep(5)
            actualizar_roles()

    if message.get("event_type") == "creus_give_user_rol":
        logger.error("[Mensajería] Procesando evento: creus_give_user_rol")
        logger.warning(f"Mensaje completo recibido: {message}")

        data = message.get("message", {})
        usuario_id = data.get("id_usuario")
        token = data.get("token")

        logger.error(f"usuario_id recibido: {usuario_id}")
        logger.error(f"token recibido (recortado): {token[:40]}...")

        if not usuario_id:
            logger.warning("ID de usuario no recibido")
            return
        if not token:
            logger.warning("Token JWT no recibido")
            return

        session = SessionLocal()
        with app_flask.app_context():
            from app.database.session import SessionLocal
            from app.models import RolUsuario, Rol, Usuario, Permiso, RolPermiso
            from flask_jwt_extended import decode_token
            from app.extensions import get_redis
            try:
                usuario = session.query(Usuario).filter_by(id_usuario=usuario_id, eliminado=False).first()
                if not usuario:
                    logger.warning(f"Usuario con ID {usuario_id} no encontrado")
                    return

                rol_creus = session.query(Rol).filter_by(nombre_rol="creus-usuario").first()
                if not rol_creus:
                    logger.error("El rol 'creus-usuario' no está creado en la base de datos")
                    return

                ya_asignado = session.query(RolUsuario).filter_by(id_usuario=usuario_id, id_rol=rol_creus.id_rol).first()
                if ya_asignado:
                    logger.error("El usuario ya tiene asignado el rol 'creus-usuario'")
                else:
                    session.add(RolUsuario(id_usuario=usuario_id, id_rol=rol_creus.id_rol))
                    session.commit()
                    logger.error("Rol 'creus-usuario' asignado correctamente")

                try:
                    logger.error(f"Intentando decodificar token: {token[:30]}...")
                    decoded = decode_token(token)
                    logger.error(f"Token decodificado correctamente: {decoded}")
                    jti = decoded.get("jti")
                    if not jti:
                        logger.warning("Token decodificado pero no contiene jti")
                        return

                    logger.error(f"JTI del token: {jti}")

                    permisos = (
                        session.query(Permiso.nombre_permiso)
                        .join(RolPermiso, Permiso.id_permiso == RolPermiso.permiso_id)
                        .join(RolUsuario, RolPermiso.id_rol == RolUsuario.id_rol)
                        .filter(RolUsuario.id_usuario == usuario_id)
                        .distinct()
                        .all()
                    )
                    permisos_lista = [p.nombre_permiso for p in permisos]

                    redis = get_redis()
                    redis.rpush(jti, *permisos_lista)
                    logger.error(f"Permisos actualizados en Redis para jti: {jti}")
                except Exception as e:
                    logger.warning("Error al actualizar permisos en Redis", exc_info=e)

            except Exception as e:
                logger.error("Error procesando evento creus_give_user_rol", exc_info=e)
                session.rollback()
            finally:
                session.close()

    logger.warning("[Mensajería] Fin del procesamiento")
