from app.models.persona_model import Persona
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
       
    def crear_persona(self, data):
        persona=self.schema.load(data)
        return
       
    def modificar_persona(self, id, data, usuario_actual):
        # Verifica que el id del usuario autenticado sea el id de la persona
        persona = Persona.query.filter_by(id_persona=id).first()
        if not persona:
            return None

        # Verifica si el usuario actual es admin, o es el usuario ligado a una persona
        es_admin = usuario_actual['rol'] == 'admin'
        es_persona = usuario_actual['id'] == persona.usuario_id

        if not (es_admin or es_persona):
            return None 
        
        # Los datos fijos solo los puede modificar el admin
        if es_admin:
            persona.nombre_persona = data.get('nombre_persona', persona.nombre_persona)
            persona.apellido_persona = data.get('apellido_persona', persona.apellido_persona)
            persona.fecha_nacimiento_persona = data.get('fecha_nacimiento_persona', persona.fecha_nacimiento_persona)
            persona.num_doc_persona = data.get('num_doc_persona', persona.num_doc_persona)

        # Los datos dinamicos los puede modificar tanto el admin como el usuario
        if 'contacto_id' in data:
            persona.contacto_id = data['contacto_id']

        Base.session.commit()
        return self.schema.dump(persona)
    
        ''' AGREGAR MAS VALIDACIONES
        usuario vacio
        403, cuando se intenta modificar una persona que no le corresponde al usuario
        '''
       
    def eliminar_persona(self, id):
        #definir logica
        return
       
       
        
