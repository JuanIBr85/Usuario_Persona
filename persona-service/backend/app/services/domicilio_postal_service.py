from app.models.domicilio_postal_model import DomicilioPostal
from app.schema.domicilio_postal_schema import DomicilioPostalSchema
from app.interfaces.domicilio_postal_interface import IDomicilioPostalInterface
from app.extensions import SessionLocal

class DomicilioPostalService(IDomicilioPostalInterface):

    def __init__(self):
        self.schema=DomicilioPostalSchema()
        self.varios_schema=DomicilioPostalSchema(many=True)

    def listar_domicilio_postal_id(self, id):
        return

    def crear_domicilio_postal(self, data, session=None):

        cerrar = False
        if session is None:    
            session= SessionLocal()
            cerrar=True

        try:
            data_validada=self.schema.load(data)
            domicilio_postal = DomicilioPostal(**data_validada)
            session.add(domicilio_postal)
            session.flush()

            return domicilio_postal
        except Exception as e:
            session.rollback()
            raise e
        finally:
            if cerrar:
                session.close()