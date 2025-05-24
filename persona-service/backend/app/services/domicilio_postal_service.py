from app.models.domicilio_postal_model import Domicilio_Postal
from app.schema.domicilio_postal_schema import DomicilioPostalSchema
from app.interfaces.domicilio_postal_interface import IDomicilioPostalInterface
from app.extensions import Base

class DomicilioPostalService(IDomicilioPostalInterface):

    def __init__(self):
        self.schema=DomicilioPostalSchema()
        self.varios_schema=DomicilioPostalSchema(many=True)

    def listar_domicilio_postal_id(self, id):
        return

    def crear_domicilio_postal(self, data):
        return    