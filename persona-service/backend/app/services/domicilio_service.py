from app.models.domicilio_model import Domicilio
from app.schema.domicilio_schema import DomicilioSchema
from app.services.domicilio_postal_service import DomicilioPostalService
from app.interfaces.domicilio_interface import IDomicilioInterface
from datetime import datetime, timezone
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
    
    def modificar_domicilio(self, id_domicilio, data, session):
        domicilio = session.query(Domicilio).get(id_domicilio)
        if not domicilio:
            raise ValueError("Domicilio no encontrado")

        campos_modificables = ['domicilio_calle', 'domicilio_numero', 'domicilio_piso', 'domicilio_dpto']

        for campo in campos_modificables:
            if campo in data:
                setattr(domicilio, campo, data[campo])

        ''' esta parte permite cambiar el id del codigo postal si se incluye
        codigo_postal es dump_only por lo que no se lo espera en edicion'''

        if 'codigo_postal_id' in data:
            domicilio.codigo_postal_id = data['codigo_postal_id']

        domicilio.updated_at = datetime.now(timezone.utc)

        session.flush() 
        return domicilio
        
    
    def borrar_domicilio(self, id_domicilio, session=None):

        cerrar= False

        if session is None:
            session = SessionLocal()
            cerrar = True

        try:
            domicilio = session.query(Domicilio).get(id_domicilio)

            if domicilio:
                domicilio.deleted_at = datetime.now(timezone.utc)
                session.flush()

            else:
                raise ValueError(f"No se encontró el contacto con id {id_domicilio}")    
            
        except Exception as e:
            session.rollback()
            raise e
        
        finally:
            if cerrar:
                session.commit()
                session.close()

         
    
    



