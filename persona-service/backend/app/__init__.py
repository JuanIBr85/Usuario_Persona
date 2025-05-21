from flask import Flask
from app.extensions import db,jwt
import os


def create_app():

    app=Flask(__name__)

    app.config.from_object("config")

    #Inicializa de las exteniciones

    db.init_app(app)
    jwt.init_app(app)
    
    #Registro de blueprints


    #Crear tablas si no existen
    
    with app.app_context():
        db.create_all()

    @app.route('/')
    def index():
        return {'msg': 'Persona Service Backend activo'}

    return app
    