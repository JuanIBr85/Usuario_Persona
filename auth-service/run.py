from flask import Flask, jsonify
from dotenv import load_dotenv
from app.routes.usuarios_blueprint import usuario_bp
import os
from flask_jwt_extended import JWTManager
from config import Config
from app.utils.utils_authorization import verificar_permisos
from app.extensions import limiter
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)

app.register_blueprint(usuario_bp)
app.config.from_object(Config)

jwt = JWTManager(app)
CORS(app, supports_credentials=True)

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

if __name__ == '__main__':
    app.run(debug=True,host='0.0.0.0', port=5000)