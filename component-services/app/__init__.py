from flask import Flask, jsonify
from flask_cors import CORS
import os
from app.extensions import engine, Base
from app.routes import register_blueprints
from common.decorators.api_access import api_access
from flask_jwt_extended import JWTManager
from app.extensions import jwt


def create_app()->Flask:

    app=Flask(__name__)

    app.config.from_object("config")

    CORS(app, supports_credentials=True)
    
    #Inicializa de las exteniciones
    jwt.init_app(app)
    with app.app_context():
        Base.metadata.create_all(bind=engine)

    @api_access(is_public=False)
    @app.route('/')
    def index():
        return jsonify({
            "message": "Bienvenido a la API de Componentes"
            }),200
    
    #Registra todas las rutas
    register_blueprints(app)
    return app