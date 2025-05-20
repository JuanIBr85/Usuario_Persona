from flask import Flask
from dotenv import load_dotenv
import os

# Cargar variables de entorno
load_dotenv()

def create_app():
    app = Flask(__name__)

    # Configuración desde variables de entorno
    app.config['ENV'] = os.getenv('FLASK_ENV', 'production')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')  # solo si se validan tokens

    # Importar e inicializar extensiones, blueprints, etc. aquí
    # por ejemplo:
    # from app.routes import main
    # app.register_blueprint(main)

    @app.route('/')
    def index():
        return {'msg': 'Persona Service Backend activo'}

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host="0.0.0.0", port=5001)