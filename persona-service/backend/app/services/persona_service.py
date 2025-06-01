from datetime import datetime, timezone
from flask import jsonify
from marshmallow import ValidationError
from sqlalchemy import and_

#Se importan los modelos
from app.models.persona_model import Persona

#Se importan los servicios
from app.services.contacto_service import ContactoService
from app.services.domicilio_service import DomicilioService


#Otras importaciones
from app.schema.persona_schema import PersonaSchema
from app.interfaces.persona_interface import IPersonaInterface
from app.extensions import SessionLocal

class PersonaService(IPersonaInterface):

    def __init__(self):
        self.schema = PersonaSchema()
        self.varios_schemas = PersonaSchema(many=True)
        self.contacto_service = ContactoService()
        self.domicilio_service = DomicilioService()
        

    def listar_personas(self):
        session = SessionLocal()
        try:
            personas = session.query(Persona).filter(Persona.deleted_at.is_(None)).all()
            return self.varios_schemas.dump(personas)
        finally:
            session.close()    
       
    def listar_persona_id(self, id):
        session = SessionLocal()
        try:
            persona = (
            session.query(Persona)
            .filter(Persona.id_persona == id, Persona.deleted_at.is_(None))
            .first()
            )

            if not persona:
                return None  
            return self.schema.dump(persona)
        finally:
            session.close() 

    def crear_persona(self, data):
        session=SessionLocal()

        try:
            if not data:
                return jsonify({"error": "No hay datos"}),400
            
            data_validada=self.schema.load(data)

            #Se crea el contacto, domicilio
            domicilio = self.domicilio_service.crear_domicilio(data_validada.pop('domicilio'), session=session)
            contacto = self.contacto_service.crear_contacto(data_validada.pop('contacto'), session=session)

            data_validada['domicilio_id']=domicilio.id_domicilio
            data_validada['contacto_id']=contacto.id_contacto
            data_validada['tipo_documento']=data_validada.pop('tipo_documento')
            

            # Crear Persona
            persona_nueva=Persona(**data_validada)
            session.add(persona_nueva)
            session.commit()
            session.refresh(persona_nueva)

            return persona_nueva

        except Exception as e:
            session.rollback()
            raise e

        finally:
            session.close()
 
    def modificar_persona(self, id, data):
        session = SessionLocal()

        try:
            persona = session.query(Persona).get(id)
            if not persona:
                return None 

            data_validada = self.schema.load(data, partial=True) #permite que la modificacion sea parcial o total

            ''' ejemplo de funcionamiento: si en el json recibe 'domicilio' llama a domiciolio_service
             para modificar ese domicilio, pasa el id existente y los nuevos datos.
              lo mismo con contacto y tipo_documento '''
            
            if 'domicilio' in data:
                self.domicilio_service.modificar_domicilio(persona.domicilio_id, data['domicilio'], session)

            if 'contacto' in data:
                self.contacto_service.modificar_contacto(persona.contacto_id, data['contacto'], session)

            if 'tipo_documento' in data:
                self.tipo_documento_service.modificar_tipo_documento(persona.tipo_documento_id, data['tipo_documento'], session)

            for field in ['nombre_persona', 'apellido_persona', 'fecha_nacimiento_persona', 'num_doc_persona', 'usuario_id']:
                if field in data_validada:
                    setattr(persona, field, data_validada[field])

            persona.updated_at = datetime.now(timezone.utc)
            session.commit()
            return self.schema.dump(persona)

        # si ocurre un error deshace los cambios 
        except Exception as e:
            session.rollback()
            raise e

        finally:
            session.close()
       
    def borrar_persona(self, id_persona): 
        session = SessionLocal()

        try:
            persona = session.query(Persona).filter(
                and_(
                    Persona.id_persona == id_persona,
                    Persona.deleted_at.is_(None)
                )
            ).first()

            if not persona:
                return None           
            if persona.contacto_id:            
                self.contacto_service.borrar_contacto(persona.contacto_id , session)
            if persona.domicilio_id:
                self.domicilio_service.borrar_domicilio(persona.domicilio_id, session)

            persona.deleted_at = datetime.now(timezone.utc)
            session.commit()
            return True

        except Exception as e:
            session.rollback()
            raise e
        
        finally:
            session.close()

    def restaurar_persona(self, id):
        session = SessionLocal()
        try:
            persona = session.query(Persona).get(id)

            if not persona:
                return None
            
            if persona.deleted_at is None:
                return False

            persona.deleted_at = None

            if persona.contacto_id:
                self.contacto_service.restaurar_contacto(persona.contacto_id, session)
            if persona.domicilio_id:
                self.domicilio_service.restaurar_domicilio(persona.domicilio_id, session)

            session.commit()
            return True

        except Exception as e:
            session.rollback()
            raise e

        finally:
            session.close()