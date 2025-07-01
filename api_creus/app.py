from flask import Flask, request, make_response
from flask_cors import CORS
from models import db
from routes import initialize_routes
from cms.routes import initialize_routes as initialize_cms_routes  # importar rutas cms
from config import config
from models.usuario import Usuario
import os
from middleware.historial_middleware import register_historial_middleware
from common.decorators.receiver import receiver
from common.utils.component_service import component_service
from flask import jsonify


def create_app(config_name="default"):
    app = Flask(__name__)

    app.config.from_object(config[config_name])

    db.init_app(app)

    #Middleware para registrar historial
    #register_historial_middleware(app)

    # Configuración mejorada de CORS
    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": ["http://localhost:3000", "http://localhost:5173"],
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allow_headers": [
                    "Content-Type",
                    "Authorization",
                    "Access-Control-Allow-Credentials",
                    "Access-Control-Allow-Headers",
                    "Access-Control-Allow-Methods",
                    "Access-Control-Allow-Origin",
                ],
                "supports_credentials": True,
                "expose_headers": ["Content-Type", "Authorization"],
                "max_age": 3600,  # Cache preflight por 1 hora
            }
        },
    )

    # Se inicializa el servicio de componentes
    component_service(app)

    # Manejo global de OPTIONS
    @app.before_request
    def handle_preflight():
        if request.method == "OPTIONS":
            response = make_response()
            response.headers.add("Access-Control-Allow-Origin", "*")
            response.headers.add("Access-Control-Allow-Headers", "*")
            response.headers.add("Access-Control-Allow-Methods", "*")
            return response

    initialize_routes(app)
    initialize_cms_routes(app)  # inicializar rutas CMS

    @app.cli.command("init-db")
    def init_db():
        """Inicializar la base de datos."""
        db.create_all()
        print("Base de datos inicializada.")

    @app.cli.command("create-admin")
    def create_admin():
        """Crear un usuario administrador por defecto."""
        with app.app_context():
            if not Usuario.query.filter_by(username="admin").first():
                admin = Usuario(
                    username="admin",
                    nombre="Administrador",
                    apellido="Sistema",
                    email="admin@example.com",
                    rol="admin",
                )
                admin.set_password("admin123")
                db.session.add(admin)
                db.session.commit()
                print("Usuario administrador creado exitosamente.")
            else:
                print("El usuario administrador ya existe.")

    with app.app_context():
        db.create_all()

    @app.route("/")
    def index():
        output = []
        for rule in app.url_map.iter_rules():
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

    return app


@receiver()
def _receiver(msg, app):
    print("Receiver:", msg)


app = create_app(config_name=os.environ.get("FLASK_ENV", "default"))

if __name__ == "__main__":
    app.run(debug=True, port=5004)
