from flask import Flask
from dotenv import load_dotenv
from app.routes.usuarios_blueprint import usuario_bp
import os
from flask_jwt_extended import JWTManager
from config import Config
from app.utils.utils_authorization import verificar_permisos
load_dotenv()

app = Flask(__name__)

app.register_blueprint(usuario_bp)
app.config.from_object(Config)

jwt = JWTManager(app)

@app.before_request
def control_acceso():
    verificar_permisos(app)
    
if __name__ == '__main__':
    app.run(debug=True,host='0.0.0.0', port=5000)