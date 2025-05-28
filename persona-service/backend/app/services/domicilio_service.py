from app.models.domicilio_model import Domicilio
from app.schema.domicilio_schema import DomicilioSchema
from app.services.domicilio_postal_service import DomicilioPostalService
from app.interfaces.domicilio_interface import IDomicilioInterface
from app.extensions import SessionLocal


class DomicilioService(IDomicilioInterface):

    def __init__(self):
        self.schema=DomicilioSchema()
        self.varios_schemas=DomicilioSchema(many=True)    
        self.domicilio_postal_service = DomicilioPostalService()

    def listar_domicilio_id(self, id):
        return
    
    def crear_domicilio(self, data, session = None):
          cerrar= False
          
          if session is None:
              session=SessionLocal()
              cerrar=True
          

          try:
              data_validada=self.schema.load(data)

              #Se crea domicilio postal

              datos_postales = data_validada.pop('codigo_postal')
              domicilio_postal = self.domicilio_postal_service.crear_domicilio_postal(datos_postales, session=session)

              data_validada['codigo_postal_id']=domicilio_postal.id_domicilio_postal

              domicilio = Domicilio(**data_validada)
              session.add(domicilio)
              session.flush()
              return domicilio
          
          except Exception as e:
              session.rollback()
              raise e
          finally:
              if cerrar:
                session.close()         
    
    def modificar_domicilio(self, id):
        return
    
    



