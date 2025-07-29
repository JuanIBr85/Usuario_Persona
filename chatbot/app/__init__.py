from flask import Flask
from common.utils.component_service import component_service
from app.routes.webhook import bp as webhook_bp
#from app.extensions import Base, engine
from common.decorators.receiver import receiver
#from app.models.registro import Registro

def create_app():

    app = Flask(__name__)

    component_service(app)

    app.register_blueprint(webhook_bp)

    # with app.app_context():
    #     Base.metadata.create_all(bind=engine)

    return app

@receiver(channel="default")
def _receiver(message: dict, app_flask: Flask):
    pass    
    
