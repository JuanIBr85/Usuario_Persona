from flask import Flask
from dotenv import load_dotenv
from app.routes.usuarios_blueprint import usuario_bp
import os
from flask_jwt_extended import JWTManager
from config import Config
from app.utils.utils_authorization import verificar_permisos
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
load_dotenv()

app = Flask(__name__)

app.register_blueprint(usuario_bp)
app.config.from_object(Config)

jwt = JWTManager(app)

@app.before_request
def control_acceso():
    verificar_permisos(app)

limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["100 per minute"], 
)
    
if __name__ == '__main__':
    app.run(debug=True,host='0.0.0.0', port=5000)