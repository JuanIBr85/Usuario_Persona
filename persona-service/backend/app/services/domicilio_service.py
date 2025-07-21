from app.models.domicilio_model import Domicilio
from app.models.domicilio_postal_model import DomicilioPostal
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
        #No esta implementado en la version actual
        return

#Crea el domicilio de la persona    
    def crear_domicilio(self, data, session = None):
          cerrar= False
          
          if session is None:
              session=SessionLocal()
              cerrar=True
              
          try:
              data_validada=self.schema.load(data)

              datos_postales = data_validada.pop('codigo_postal')
              codigo_postal = datos_postales.get('codigo_postal')
              localidad = datos_postales.get('localidad')

              domicilio_postal=session.query(DomicilioPostal).filter_by(
                  codigo_postal=codigo_postal,
                  localidad=localidad
              ).first()

              if not domicilio_postal:
                  raise ValueError(f"No se encontró un domicilio postal con código postal '{codigo_postal}' y localidad '{localidad}'")
              
              data_validada['codigo_postal_id'] = domicilio_postal.id_domicilio_postal

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


#Metodo para modidicar un domicilio determinado a traves del id
    def modificar_domicilio(self, id_domicilio, data, session):
        domicilio = session.query(Domicilio).get(id_domicilio)
        if not domicilio:
            raise ValueError("Domicilio no encontrado")

        campos_modificables = [
            'domicilio_calle',
            'domicilio_numero', 
            'domicilio_piso', 
            'domicilio_dpto',
            'domicilio_referencia'
            ]
        
        cambios = False

        for campo in campos_modificables:
            if campo in data:
                nuevo_valor = data[campo]
                if getattr(domicilio, campo) != nuevo_valor:
                    setattr(domicilio, campo, nuevo_valor)
                    cambios = True

        ''' esta parte permite cambiar el id del codigo postal si se incluye
        codigo_postal es dump_only por lo que no se lo espera en edicion'''

        if "codigo_postal" in data:
            cp_data = data["codigo_postal"]
            codigo_postal = cp_data.get("codigo_postal")
            localidad = cp_data.get("localidad")

        if codigo_postal and localidad:
            
            dom_postal = session.query(DomicilioPostal).filter_by(
                codigo_postal=codigo_postal.strip(),
                localidad=localidad.strip(),
            ).first()

            if not dom_postal:
                raise ValueError("No se encontró el domicilio postal")
            
            if domicilio.codigo_postal_id != dom_postal.id_domicilio_postal:
                domicilio.codigo_postal_id = dom_postal.id_domicilio_postal
                cambios = True

        if cambios:
            domicilio.updated_at = datetime.now(timezone.utc)
            session.flush()
 
        return cambios
        
   #Metodo para borrar logicamente el domicilio de la persona asociada al id 
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
   #Metodo para restaurar el borrado logico del domicilio 
    def restaurar_domicilio(self, id, session=None):
        cerrar=False

        if session is None:
            session=SessionLocal()
            cerrar=True

        try:
            domicilio = session.query(Domicilio).get(id) 
            if domicilio:
                domicilio.deleted_at = None
                session.flush()
            else:
                raise ValueError(f"No se encontró el contacto con id {id}")

        except Exception as e:
            session.rollback()
            raise e
        
        finally:
            if cerrar:
                session.commit()
                session.close()

    
    



