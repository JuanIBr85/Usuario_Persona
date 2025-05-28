from flask import Flask
from dotenv import load_dotenv
from app.routes.usuarios_blueprint import usuario_bp
import os
from flask_jwt_extended import JWTManager
from flask_cors import CORS  # <--- Importa CORS
from config import Config

load_dotenv()

app = Flask(__name__)

# Configuración de CORS (agrega esto)
CORS(app, origins=["http://localhost:5173"])  # O quita origins si quieres permitir todos los dominios: CORS(app)

# Configuración de la app
app.register_blueprint(usuario_bp)
app.config.from_object(Config)

# JWT
jwt = JWTManager(app)

# Iniciar servidor
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
