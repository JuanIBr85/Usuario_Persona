from app.models.persona_extendida_model import PersonaExtendida
from app.schema.persona_extendida_schema import PersonaExtendidaSchema
from app.interfaces.persona_extendida_interface import IPersonaExtendidaInterface 
from datetime import datetime, timezone
from app.extensions import SessionLocal


class PersonaExtendidaService(IPersonaExtendidaInterface):

    def __init__(self):
        self.schema=PersonaExtendidaSchema()

    def listar_personas_extendida(self):
        return super().listar_personas_extendida()


    def listar_persona_extendida_id(self, id):
        return super().listar_persona_extendida_id(id)    

    def crear_persona_extendida(self, data, session=None):
        cerrar = False
        if session is None:
            session=SessionLocal()
            cerrar = True

        try:

            data_validada = self.schema.load(data)

            persona_ext = PersonaExtendida(**data_validada)
            session.add(persona_ext)
            session.flush()

            return persona_ext

        except Exception as e:
            session.rollback()
            raise e

        finally:
            if cerrar:
                session.close()    

    def modificar_persona_extendida(self, id, data):
        return super().modificar_persona_extendida(id, data)
    
    def borrar_persona_extendida(self, id):
        return super().borrar_persona_extendida(id)
    
    def restaurar_persona_extendida(self, id):
        return super().restaurar_persona_extendida(id)


    