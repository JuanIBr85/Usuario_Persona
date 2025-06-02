from flask import Flask
from dotenv import load_dotenv
from app.routes.usuarios_blueprint import usuario_bp
import os
from flask_jwt_extended import JWTManager
from config import Config
from app.utils.utils_authorization import verificar_permisos
from app.extensions import limiter, mail
from app.routes.superadmin_blueprint import superadmin_bp
from app.routes.admin_microservicios_blueprint import admin_micro_bp
from app.script.reset_db import crear_base, eliminar_base
from app.script.seed_data import seed

load_dotenv()

app = Flask(__name__)
app.register_blueprint(superadmin_bp, url_prefix='/super-admin')
app.register_blueprint(admin_micro_bp, url_prefix='/admin-micro')
app.register_blueprint(usuario_bp)
app.config.from_object(Config)
jwt = JWTManager(app)
mail.init_app(app)

@app.before_request
def control_acceso():
    verificar_permisos(app)

limiter.init_app(app)

def init_app():
    FORZAR_RESET = True  # poner True para resetear cada vez que se cree (solo para desarrollo)
    db_path = os.path.join("auth_data", "auth.db")
    if FORZAR_RESET or not os.path.exists(db_path):
        print("[i] Reiniciando base de datos y datos iniciales...")
        eliminar_base()
        crear_base()
        seed()
    else:
        print("[✓] Base de datos ya existente. No se reinicia.")

if __name__ == '__main__':
    # Evitar ejecutar init_app() dos veces cuando el reloader está activo
    if os.environ.get("WERKZEUG_RUN_MAIN") != "true":
        init_app()
    app.run(debug=True, use_reloader=False, host='0.0.0.0', port=5000)