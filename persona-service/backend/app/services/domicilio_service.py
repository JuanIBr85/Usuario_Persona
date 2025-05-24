from app.models.domicilio_model import Domicilio
from app.schema.domicilio_schema import DomicilioShema
from app.interfaces.domicillio_interface import IDomicilioInterface
from app.extensions import Base


class DomicilioService(IDomicilioInterface):

    def __init__(self):
        self.schema=DomicilioShema()
        self.varios_schemas=DomicilioShema(many=True)

    def listar_domicilio_id(self, id):
        return
    
    def crear_domicilio(self, data):
        return
    
    def modificar_domicilio(self, id):
        return
    
    



