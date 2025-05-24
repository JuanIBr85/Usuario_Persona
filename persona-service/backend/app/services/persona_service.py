from app.models.persona_model import Persona
from app.schema.persona_schema import PersonaSchema
from app.interfaces.persona_interface import IPersonaInterface
from app.extensions import Base


class PersonaService(IPersonaInterface):

       def __init__(self):
        self.schema = PersonaSchema()
        self.varios_schemas = PersonaSchema(many=True)

       def listar_personas(self):
           #definir logica
           return
       
       def listar_persona_id(self, id):
           #definir logica
           return 
       
       def crear_persona(self, data):
           persona=self.schema.load(data)
           
           return
       
       def modificar_persona(self, id, data):
           #definir logica
           return
       
       def eliminar_persona(self):
           #definir logica
           return
       
       
        
