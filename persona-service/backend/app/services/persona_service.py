from datetime import datetime, timezone
from flask import jsonify
from marshmallow import ValidationError
from sqlalchemy import and_

#Se importan los modelos
from app.models.persona_model import Persona

#Se importan los servicios
from app.services.contacto_service import ContactoService
from app.services.domicilio_service import DomicilioService
from app.services.tipo_documente_service import TipoDocumentoService

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
        self.tipo_documento_service = TipoDocumentoService()

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

            #Se crea el contacto, domicilio y documento
            domicilio = self.domicilio_service.crear_domicilio(data_validada.pop('domicilio'), session=session)
            contacto = self.contacto_service.crear_contacto(data_validada.pop('contacto'), session=session)
            tipo_documento = self.tipo_documento_service.crear_tipo_documento(data_validada.pop('tipo_documento'), session=session)

            data_validada['domicilio_id']=domicilio.id_domicilio
            data_validada['contacto_id']=contacto.id_contacto
            data_validada['tipo_documento_id']=tipo_documento.id_tipo_documento

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
        #definir logica
        return
       
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

       
       
        
