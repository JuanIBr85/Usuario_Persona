from flask import Flask, jsonify
from flask_cors import CORS
from app.extensions import jwt, engine, Base
from app.models.persona_model import Persona
from app.models.contacto_model import Contacto
from app.models.domicilio_model import Domicilio
from app.models.domicilio_postal_model import Domicilio_Postal


def create_app():

    app=Flask(__name__)

    app.config.from_object("config")


    CORS(app, supports_credentials=True)
    
    #Inicializa de las exteniciones
    jwt.init_app(app)
    
    #Registro de blueprints
    from app.routes.persona_routes import persona_bp
    from app.routes.opciones_routes import opciones_bp
    app.register_blueprint(persona_bp, url_prefix='/api')
    app.register_blueprint(opciones_bp, url_prefix='/api')

    #Crear tablas si no existen
    
    with app.app_context():
        Base.metadata.create_all(bind=engine)

    
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

    return app
    