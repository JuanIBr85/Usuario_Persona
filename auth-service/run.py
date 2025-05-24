from flask import Flask
from dotenv import load_dotenv
from app.routes.usuarios_blueprint import usuario_bp
import os
from flask_jwt_extended import JWTManager
from config import Config
load_dotenv()

app = Flask(__name__)

app.register_blueprint(usuario_bp)
app.config.from_object(Config)

jwt = JWTManager(app)


if __name__ == '__main__':
    app.run(debug=True,host='0.0.0.0', port=5000)