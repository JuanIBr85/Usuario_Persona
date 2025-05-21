from flask import Flask
from dotenv import load_dotenv
from app.routes.usuarios_blueprint import usuario_bp
import os

load_dotenv()

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.register_blueprint(usuario_bp)

@app.route('/')
def index():
    return 'Auth Service Running'

if __name__ == '__main__':
    app.run(debug=True,host='0.0.0.0', port=5000)