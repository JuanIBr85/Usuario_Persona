from flask import jsonify, request
from marshmallow import ValidationError
from app.models.persona_model import Persona
from app.models.domicilio_model import Domicilio
from app.models.domicilio_postal_model import Domicilio_Postal
from app.models.contacto_model import Contacto
from app.models.tipo_doc_model import Tipo_Documento
from app.schema.persona_schema import PersonaSchema
from app.interfaces.persona_interface import IPersonaInterface
from app.extensions import Base
from app.extensions import SessionLocal

class PersonaService(IPersonaInterface):

    def __init__(self):
        self.schema = PersonaSchema()
        self.varios_schemas = PersonaSchema(many=True)

    def listar_personas(self):
        session = SessionLocal()
        try:
            personas = session.query(Persona).all()
            return self.varios_schemas.dump(personas)
        finally:
            session.close()
       
    def listar_persona_id(self, id):
        session = SessionLocal()
        try:
            persona = session.query(Persona).get(id)
            if not persona:
                return None  
            return self.schema.dump(persona)
        finally:
            session.close() 


#Se crea la persona 

    def crear_persona(self, data):

        session=SessionLocal()

        try:
            json_data=request.get_json()
            if not json_data:
                return jsonify({"error": "No hay datos"}),400
            
            data=self.schema.load(json_data)

            #se crea el domicilio postal
            domicilio_postal_data = json_data['domicilio']['codigo_postal']
            domicilio_postal = Domicilio_Postal(
                codigo_postal=domicilio_postal_data['codigo_postal'],
                localidad=domicilio_postal_data['localidad'],
                partido=domicilio_postal_data['partido'],
                provincia=domicilio_postal_data['privincia'],
                pais=domicilio_postal_data['pais']
            )
            session.add(domicilio_postal)
            session.flush()

            # Crear Domicilio
            domicilio_data = json_data['domicilio']
            domicilio = Domicilio(
                domicilio_calle=domicilio_data['calle'],
                domicilio_numero=domicilio_data['numero'],
                domicilio_piso=domicilio_data.get('piso'),
                domicilio_dpto=domicilio_data.get('departamento'),
                codigo_postal_id=domicilio_postal.id_domicilio_postal
            )
            session.add(domicilio)
            session.flush()

            # Crear Contacto
            contacto_data = json_data['contacto']
            contacto = Contacto(
                telefono_fijo_=contacto_data.get('telefono_fijo'),
                telefono_movil_=contacto_data['telefono_movil'],
                red_social_contacto=contacto_data.get('red_social_contacto')
            )
            session.add(contacto)
            session.flush()

            # Crear Persona
            persona = Persona(
                nombre_persona=data['nombre_persona'],
                apellido_persona=data['apellido_persona'],
                fecha_nacimiento_persona=data['fecha_nacimiento_persona'],
                num_doc_persona=data['num_doc_persona'],
                usuario_id=data['usuario_id'],
                tipo_documento_id=data['tipo_documento_id'],
                domicilio_id=domicilio.id_domicilio,
                contacto_id=contacto.id_contacto
            )
            session.add(persona)
            session.commit()

            return jsonify({
                "mensaje": "Persona creada exitosamente",
                "persona": self.schema.dump(persona)
            }), 201

        except ValidationError as err:
            session.rollback()
            return jsonify({"errores": err.messages}), 400

        finally:
            session.close()
 
    def modificar_persona(self, id, data):
        #definir logica
        return
       
    def eliminar_persona(self, id):
        #definir logica
        return
       
       
        
