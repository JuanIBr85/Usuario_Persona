from flask import Flask, jsonify
from flask_cors import CORS
import os
from app.extensions import jwt, engine, Base


def create_app()->Flask:

    app=Flask(__name__)

    app.config.from_object("config")

    CORS(app, supports_credentials=True)
    
    #Inicializa de las exteniciones
    jwt.init_app(app)
    with app.app_context():
        Base.metadata.create_all(bind=engine)

    @app.route('/service')
    def index():
        return jsonify({
            "message": "Bienvenido a la API de Componentes"
        }),200

    # Importar y registrar blueprints
    from app.routes import bp as routes_bp
    app.register_blueprint(routes_bp)
    from app.routes import bp2 as routes_bp2
    app.register_blueprint(routes_bp2)

    return app