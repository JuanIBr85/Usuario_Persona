from flask import Flask
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')

@app.route('/')
def index():
    return 'Auth Service Running'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)