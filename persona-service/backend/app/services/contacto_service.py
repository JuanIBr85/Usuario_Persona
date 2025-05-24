from app.models.contacto_model import Contacto
from app.schema.contacto_schema import ContactoSchema
from app.interfaces.contacto_interface import IContactoInterface
from app.extensions import Base

class ContactoService(IContactoInterface):

    def __init__(self):
        self.schema=ContactoSchema
        self.varios_schema=ContactoSchema(many=True)

    def crear_contacto(self, data):
        return

    def listar_contacto_id(self, id):
        return

    def modificar_contacto(self, id, data):
        return
    
        