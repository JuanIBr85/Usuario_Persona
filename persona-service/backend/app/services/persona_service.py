from datetime import datetime, timezone, timedelta
from flask import jsonify
from flask_jwt_extended import create_access_token
from marshmallow import ValidationError
from sqlalchemy import and_, func,extract

#Se importan los modelos
from app.models.persona_model import Persona
from app.models.persona_extendida_model import PersonaExtendida

#Se importan los servicios
from app.services.contacto_service import ContactoService
from app.services.domicilio_service import DomicilioService
from app.services.persona_extendida_service import PersonaExtendidaService
from app.services.otp_service import OtpService


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
        self.persona_ext_service = PersonaExtendidaService()
        self.otp_service = OtpService()
        

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

            extendida = data_validada.pop('persona_extendida', {})
            persona_extendida = self.persona_ext_service.crear_persona_extendida(extendida,session=session)

            data_validada['domicilio_id']=domicilio.id_domicilio
            data_validada['contacto_id']=contacto.id_contacto
            data_validada['extendida_id'] = persona_extendida.id_extendida
            data_validada['tipo_documento']=data_validada.pop('tipo_documento')
            

            # Crear Persona
            persona_nueva=Persona(**data_validada)
            session.add(persona_nueva)
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
              lo mismo con contacto y persona extendida '''
            
            if 'domicilio' in data:
                self.domicilio_service.modificar_domicilio(persona.domicilio_id, data['domicilio'], session)

            if 'contacto' in data:
                self.contacto_service.modificar_contacto(persona.contacto_id, data['contacto'], session)

            if 'persona_extendida' in data:
                if persona.persona_extendida:
                    self.persona_ext_service.modificar_persona_extendida(persona.extendida_id,data['persona_extendida'], session)

            for field in ['nombre_persona', 'apellido_persona', 'fecha_nacimiento_persona', 'num_doc_persona' , 'tipo_documento']: 
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

    def modificar_persona_restringido(self, id, data):
        session = SessionLocal()

        try:
            persona = (
                session.query(Persona)
                .filter(Persona.id_persona == id, Persona.deleted_at.is_(None))
                .first()
            )

            if not Persona:
                return None
            
            data_validada = self.schema.load(data, partial=True)

            if 'domicilio' in data:
                self.domicilio_service.modificar_domicilio(persona.domicilio_id, data['domicilio'], session)

            if 'contacto' in data:
                self.contacto_service.modificar_contacto(persona.contacto_id, data['contacto'], session)

            if 'persona_extendida' in data:
                if persona.persona_extendida:
                    self.persona_ext_service.modificar_persona_extendida(persona.extendida_id,data['persona_extendida'], session)

            # Permiten cambios cada 30 días
            campos_modificables_cada_30_dias = ['nombre_persona', 'apellido_persona']

            # No deberían cambiarse automáticamente
            campos_no_modificables = ['fecha_nacimiento_persona', 'num_doc_persona', 'tipo_documento']   

            ahora = datetime.now(timezone.utc)
            dias_restriccion=30 

            #Campos no modificables por el usuario
            for campo in campos_no_modificables:
                if campo in data_validada:
                    valor_actual = getattr(persona, campo)
                    nuevo_valor = data_validada[campo]   

                    if str(nuevo_valor).strip() != str(valor_actual).strip():
                        raise Exception(f"El campo '{campo}' no puede modificarse directamente. Contacte al administrador.")
                     
            #Campos editables con restriccion temporal
            evaluar_restriccion = False
            cambios_realizados = []

            for campo in campos_modificables_cada_30_dias:
                if campo in data_validada:
                    actual = getattr(persona, campo)
                    nuevo = data_validada[campo]
                    if str(nuevo).strip() != str(actual).strip():
                        evaluar_restriccion = True
                        cambios_realizados.append(campo)


            if evaluar_restriccion:
                ultima_modificacion = persona.updated_at

                if not ultima_modificacion:
                    ultima_modificacion = ahora - timedelta(days=31)
                elif ultima_modificacion.tzinfo is None:
                    ultima_modificacion = ultima_modificacion.replace(tzinfo=timezone.utc)

                dias=(ahora - ultima_modificacion).days
                evaluar_restriccion = False 

                if dias < dias_restriccion:
                    raise Exception(
                            f"Los campos Nombre y Apellido solo pueden modificarse cada {dias_restriccion} días. Si es necesario contacte a un administrador. "
                            f"Última modificación: {ultima_modificacion.date()}"
                        )
                 #Aplica las modificaciones 
            hubo_cambios = False  
            for campo in cambios_realizados:
                setattr(persona, campo, data_validada[campo])
                hubo_cambios = True

            if hubo_cambios:
                persona.updated_at = ahora
                session.commit()
            else:
                session.flush()

            return self.schema.dump(persona)
        
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

            if persona.extendida_id:
                self.persona_ext_service.borrar_persona_extendida(persona.extendida_id, session)

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

    #VERIFICACION DE PERSONA CON DOCUMENTO
    def verificar_o_crear_persona(self, usuario_id: int, datos: dict) -> dict:
        """
        si la persona no existe la crea
        si la persona existe, genera un OTP, lo envía y devuelve un JWT con el código
           en sus claims para que el cliente lo valide luego.
        """
        session = SessionLocal()
        try:
            persona = (
                session
                .query(Persona)
                .filter(
                    Persona.tipo_documento == datos['tipo_documento'],
                    Persona.num_doc_persona == datos['num_doc_persona']
                )
                .first()
            )

            if persona is None:
                datos['usuario_id'] = usuario_id
                nueva_persona = self.crear_persona(datos)
                return {'persona': nueva_persona}

            
            codigo = self.otp_service.solicitar_otp(persona)

            # se crea un token que incluye el otp
            token = create_access_token(
                identity=usuario_id,
                additional_claims={
                    'persona_id': persona.id_persona,
                    'otp': codigo
                },
                expires_delta=timedelta(minutes=15)
            )
            return {'otp_token': token}

        finally:
            session.close()