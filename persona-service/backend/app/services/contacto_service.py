from app.models.contacto_model import Contacto
from app.schema.contacto_schema import ContactoSchema
from app.interfaces.contacto_interface import IContactoInterface
from app.extensions import SessionLocal

class ContactoService(IContactoInterface):

    def __init__(self):
        self.schema=ContactoSchema()

    def crear_contacto(self, data, session = None):

        cerrar = False
        if session is None:
            session=SessionLocal()
            cerrar = True

        try: 

            print("Datos recibidos para contacto:", data)
            data_validada=self.schema.load(data)
            print("Contacto validado:", data_validada)


            contacto=Contacto(**data_validada)
            session.add(contacto)
            session.flush()
            return contacto
        
        except Exception as e:
            session.rollback()
            raise e

        finally:
             if cerrar:
                session.close()

    def listar_contacto_id(self, id):
        return

    def modificar_contacto(self, id, data):
        return
    
        