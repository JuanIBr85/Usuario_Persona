from app.models.contacto_model import Contacto
from app.schema.contacto_schema import ContactoSchema
from app.interfaces.contacto_interface import IContactoInterface
from datetime import datetime, timezone
from app.extensions import SessionLocal

class ContactoService(IContactoInterface):
    """Gestiona las operaciones CRUD sobre el modelo "Contacto" ."""

    def __init__(self):
        """Inicializa el esquema de validación."""
        self.schema=ContactoSchema()

    def crear_contacto(self, data, session = None):
        """Crea un contacto y lo asocia a la sesión dada."""

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
        """No implementado en la versión actual."""
        return

    def modificar_contacto(self, id_contacto, data, session):
        """Actualiza campos editables de un contacto existente."""

        contacto = session.query(Contacto).get(id_contacto)
        if not contacto:
            raise ValueError("Contacto no encontrado")

        campos_editables = [
                "telefono_fijo", 
                "telefono_movil",
                "red_social_contacto",
                "red_social_nombre",
                "email_contacto",
                "observacion_contacto",
                ]
        
        cambios = False

        for campo in campos_editables:
            if campo in data:
                nuevo_valor = data[campo]
                valor_actual = getattr(contacto, campo) 

                if valor_actual != nuevo_valor:
                    setattr(contacto, campo, nuevo_valor)
                    cambios = True

        if cambios:    
            contacto.updated_at = datetime.now(timezone.utc)
            session.flush() 

        return cambios
    

    def borrar_contacto(self, id_contacto, session=None):
        """Marca un contacto, eliminandolo de forma lógica."""

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

    def restaurar_contacto(self, id, session=None):
        """Revierte el borrado lógico de un contacto."""

        cerrar = False

        if session is  None:
            session=SessionLocal()
            cerrar=True

        try:
            contacto=session.query(Contacto).get(id)
            if contacto:
                contacto.deleted_at = None 
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
    