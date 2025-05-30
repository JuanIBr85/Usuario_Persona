from app.models.contacto_model import Contacto
from app.schema.contacto_schema import ContactoSchema
from app.interfaces.contacto_interface import IContactoInterface
from datetime import datetime, timezone
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

            data_validada=self.schema.load(data)

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

    def modificar_contacto(self, id_contacto, data, session):
        contacto = session.query(Contacto).get(id_contacto)
        if not contacto:
            raise ValueError("Contacto no encontrado")

        campos_editables = ['telefono_fijo', 'telefono_movil', 'red_social_contacto']

        for campo in campos_editables:
            if campo in data:
                setattr(contacto, campo, data[campo])

        contacto.updated_at = datetime.now(timezone.utc)
        session.flush() 

        return contacto
    

    def borrar_contacto(self, id_contacto, session=None):

        cerrar=False

        if session is None:
            session = SessionLocal()
            cerrar = True

        try:    

            contacto = session.query(Contacto).get(id_contacto)
            if contacto:
                contacto.deleted_at = datetime.now(timezone.utc)

                session.flush()
            else:
                raise ValueError(f"No se encontró el contacto con id {id_contacto}")    
            
        except Exception as e:
            session.rollback()
            raise e
        
        finally:
            if cerrar:
                session.close()
                session.commit()


   


    
        