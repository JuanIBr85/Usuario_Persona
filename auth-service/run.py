from flask import Flask, jsonify
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
from flask_cors import CORS
from app.utils.response import register_error_handlers
from app.utils.make_endpoints_list import make_endpoints_list

load_dotenv()

app = Flask(__name__)
app.register_blueprint(superadmin_bp, url_prefix='/super-admin')
app.register_blueprint(admin_micro_bp, url_prefix='/admin-micro')
app.register_blueprint(usuario_bp)
app.config.from_object(Config)

# ==========================
# DEBUGGING
# ==========================
print("MAIL_SERVER:", app.config.get("MAIL_SERVER"))
print("MAIL_PORT:", app.config.get("MAIL_PORT"))
print("MAIL_USERNAME:", app.config.get("MAIL_USERNAME"))
print("MAIL_PASSWORD:", app.config.get("MAIL_PASSWORD")[:3] + "***") 
# ==========================
# ==========================

mail.init_app(app)

jwt = JWTManager(app)
CORS(app, supports_credentials=True)
mail.init_app(app)
register_error_handlers(app) # maneja los errores y excepciones globales y las convierte a un formato con build_response

@app.before_request
def control_acceso():
    verificar_permisos(app)

limiter.init_app(app)

@app.route('/')
def index():
    output = []
    for rule in app.url_map.iter_rules():
        if rule.endpoint == 'static': continue
        methods = sorted(rule.methods - {'HEAD', 'OPTIONS'})
        output.append({
            'endpoint': rule.endpoint,
            'methods': ", ".join(methods),
            'rule': str(rule)
        })
    return jsonify(output)

index._security_metadata ={
    "is_public":True
}


@app.route('/components')
def endpoints():
    return jsonify(make_endpoints_list(app)),200
endpoints._security_metadata ={
    "is_public":True
}

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
    # Evitar ejecutar init_app() dos veces cuando el reloader está activo
if os.environ.get("WERKZEUG_RUN_MAIN") != "true":
    init_app()

if __name__ == '__main__':

    app.run(debug=True, use_reloader=True, host='0.0.0.0', port=5000)