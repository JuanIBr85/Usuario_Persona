from datetime import datetime, timezone
from flask import jsonify
from marshmallow import ValidationError
from sqlalchemy import and_, func,extract

#Se importan los modelos
from app.models.persona_model import Persona
from app.models.persona_extendida_model import PersonaExtendida

#Se importan los servicios
from app.services.contacto_service import ContactoService
from app.services.domicilio_service import DomicilioService


#Otras importaciones
from app.schema.persona_schema import PersonaSchema,PersonaResumidaSchema
from app.interfaces.persona_interface import IPersonaInterface
from app.extensions import SessionLocal
from app.schema.persona_extendida_schema import PersonaExtendidaSchema

class PersonaService(IPersonaInterface):

    def __init__(self):
        self.schema = PersonaSchema()
        self.varios_schemas = PersonaResumidaSchema(many=True)
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


    def listar_persona_usuario_id(self, id):
        session = SessionLocal()
        try:
            persona = (
            session.query(Persona)
            .filter(Persona.usuario_id == id, Persona.deleted_at.is_(None))
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

            datos_extendida = data_validada.pop('persona_extendida', None)

            data_validada['domicilio_id']=domicilio.id_domicilio
            data_validada['contacto_id']=contacto.id_contacto
            data_validada['tipo_documento']=data_validada.pop('tipo_documento')
            

            # Crear Persona
            persona_nueva=Persona(**data_validada)
            session.add(persona_nueva)
            session.flush()

            if datos_extendida:
                extendida = PersonaExtendida(id_extendida=persona_nueva.id_persona, **datos_extendida)
                session.add(extendida)
                persona_nueva.persona_extendida = extendida

            session.commit()
            session.refresh(persona_nueva)

            return persona_nueva

        except Exception as e:
            session.rollback()

            if "UNIQUE constraint failed: personas.usuario_id" in str(e):
                raise Exception ("Usuario ya tiene una persona asociada, no se puede crear más de un perfil de persona por usuario")

            raise e

        finally:
            session.close()
 
    def modificar_persona(self, id, data):
        session = SessionLocal()

        try:
            #persona = session.query(Persona).get(id)

            persona = (
            session.query(Persona)
            .filter(Persona.id_persona == id, Persona.deleted_at.is_(None))
            .first()
            )
            
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

            if 'persona_extendida' in data:
                datos_extendida=data['persona_extendida'] 
                validate_data = PersonaExtendidaSchema().load(
                        datos_extendida, 
                        partial=True
                    )
                if persona.persona_extendida:
                    for key, value in validate_data.items():
                        setattr(persona.persona_extendida, key, value)

                    persona.persona_extendida.updated_at = datetime.now(timezone.utc)
                else:
                    nueva_extendida = PersonaExtendida(**validate_data)
                    nueva_extendida.id_extendida = persona.id_persona
                    session.add(nueva_extendida)
                    persona.persona_extendida = nueva_extendida     


            for field in ['nombre_persona', 'apellido_persona', 'fecha_nacimiento_persona', 'num_doc_persona']: 
                if field in data_validada:
                    setattr(persona, field, data_validada[field])

            persona.updated_at = datetime.now(timezone.utc)
            session.commit()
            return self.schema.dump(persona)

        # si ocurre un error deshace los cambios 
        except Exception as e:
            import traceback
            print("Error al modificar persona:")
            print(traceback.format_exc())
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
            
    def contar_personas(self):
        session = SessionLocal()
        try:
            resultados = session.query(
                extract('year', Persona.created_at).label('year'),
                extract('month', Persona.created_at).label('month'),
                func.count(Persona.id_persona).label('total')
            ).filter(Persona.deleted_at.is_(None)) \
            .group_by('year', 'month') \
            .order_by('year', 'month') \
            .all()

            return [
                {
                    "year": r.year,
                    "month": int(r.month),
                    "total": r.total
                }
                for r in resultados
            ]
        finally:
            session.close()
