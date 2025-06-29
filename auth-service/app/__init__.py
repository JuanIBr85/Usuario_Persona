from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os
import sys

from ast import Dict
import logging

# Estos paquetes vienen del modulo common del servicio de componentes
from common.decorators.receiver import receiver
from common.utils.component_service import component_service
from common.services.send_message_service import send_message
from common.utils.component_service import component_service
from common.decorators.api_access import api_access


import requests
from app.script.reset_db import crear_base, eliminar_base
from app.script.seed_data import seed
from app.routes.usuarios_blueprint import usuario_bp
from app.routes.superadmin_blueprint import superadmin_bp
from app.routes.admin_microservicios_blueprint import admin_micro_bp
from app.extensions import mail

from app.database.session import SessionLocal
from app.models.rol import Rol, RolUsuario
from app.models.permisos import Permiso, RolPermiso


def create_app():
    load_dotenv()
    app_flask = Flask(__name__)
    app_flask.config.from_object("config.Config")

    # inicializo extensiones
    mail.init_app(app_flask)
    JWTManager(app_flask)
    CORS(
        app_flask,
        resources={r"/*": {"origins": "*"}},
        supports_credentials=True,
        allow_headers=[
            "Content-Type",
            "Authentication",
            "authorization",
            "Authorization",
        ],
    )
    component_service(app_flask)
    # registro blueprints
    app_flask.register_blueprint(superadmin_bp, url_prefix="/super-admin")
    app_flask.register_blueprint(admin_micro_bp, url_prefix="/admin-micro")
    app_flask.register_blueprint(usuario_bp)
    from app.messaging import receivers

    import logging

    logging.basicConfig(
        level=logging.INFO,  # También podés usar DEBUG para más detalle
        format="%(asctime)s %(levelname)s: %(message)s",
    )

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


import requests

COMPONENT_SERVICE_URL = "http://localhost:5002"


def actualizar_permisos():
    # Obtengo el listado de permisos del servicio de componentes
    response = requests.get(
        f"{COMPONENT_SERVICE_URL}/internal/services/recolect_perms", timeout=5
    )
    if response.status_code == 200:
        print("[✓] Permisos actualizados correctamente.")

        # Extraigo los permisos
        permisos: list[str] = response.json()["data"]

        try:
            db = SessionLocal()
            # Obtener todos los permisos existentes de una sola vez
            permisos_existentes = {
                p.nombre_permiso: p
                for p in db.query(Permiso)
                .filter(Permiso.nombre_permiso.in_(permisos))
                .all()
            }

            # Filtrar solo los permisos que no existen
            nuevos_permisos = [
                Permiso(nombre_permiso=nombre)
                for nombre in permisos
                if nombre not in permisos_existentes
            ]

            # Si no hay nuevos permisos, no hago nada
            if len(nuevos_permisos) == 0:
                return

            # Insertar todos los nuevos permisos de una sola vez
            if nuevos_permisos:
                db.bulk_save_objects(nuevos_permisos)
                db.commit()

                # Obtener los nombres de los permisos recién insertados
                nombres_permisos = [p.nombre_permiso for p in nuevos_permisos]

                # Consultar los permisos recién insertados para obtener sus IDs
                permisos_guardados = (
                    db.query(Permiso)
                    .filter(Permiso.nombre_permiso.in_(nombres_permisos))
                    .all()
                )

                # Actualizar los permisos del rol de superadmin
                rol = db.query(Rol).filter_by(nombre_rol="superadmin").first()
                for permiso in permisos_guardados:
                    # Verificar si la relación ya existe
                    existe = (
                        db.query(RolPermiso)
                        .filter_by(id_rol=rol.id_rol, permiso_id=permiso.id_permiso)
                        .first()
                    )
                    if not existe:
                        db.add(
                            RolPermiso(id_rol=rol.id_rol, permiso_id=permiso.id_permiso)
                        )
                db.commit()
        finally:
            db.close()

    else:
        print(f"[x] Error al actualizar permisos: {response.status_code}")


@receiver(channel="default")
# Este es un decorador que recibe mensajes de un canal
# el canal "default" es el canal por defecto
# esta funcion recibe un mensaje y lo procesa en un hilo separado
def funcion_que_recibe_mensajes(message: dict, app_flask: Flask) -> None:
    event_type = message.get("event_type")
    if event_type == "gateway-research" or event_type == "component-start-service":
        with app_flask.app_context():
            actualizar_permisos()

    logging.warning("[Mensajería] Mensaje recibido:")
    logging.warning(message)
