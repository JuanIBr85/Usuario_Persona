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

    def modificar_persona_extendida(self, id, data, session=None):

        cerrar = False
        if session is None:
            session = SessionLocal()
            cerrar = True

        try:

            persona_ext = (
                session.query(PersonaExtendida).filter_by(id_extendida=id).first()
            )

            if not persona_ext:
                raise Exception("Persona extendida no encontrada")

            data_validada = self.schema.load(data, partial=True)

            cambios = False    
            for campo, valor in data_validada.items():
                if getattr(persona_ext, campo) != valor:
                    setattr(persona_ext,campo,valor)
                    cambios = True

            if cambios:
                persona_ext.updated_at = datetime.now(timezone.utc)    

                if cerrar:    
                    session.commit()    
                else:
                    session.flush()    
            session.refresh(persona_ext)

            return cambios

        except Exception as e:
            session.rollback()
            raise e

        finally:
            if cerrar:
                session.close()
        
    
    def borrar_persona_extendida(self, id, session =None):
        cerrar = False
        if session is None:
            session = SessionLocal()
            cerrar = True

        try:

            persona_ext = session.query(PersonaExtendida).get(id)
            if persona_ext:
                persona_ext.deleted_at = datetime.now(timezone.utc)
            else:
                raise ValueError (f"No se encontró ese id: {id}")

        except Exception as e:
            session.rollback()
            raise e

        finally:
            if cerrar:
                session.close()
                session.commit()

    
    def restaurar_persona_extendida(self, id,session=None):
        cerrar = False

        if session is None:
            session = SessionLocal()
            cerrar = True

        try:
            persona_ext = session.query(PersonaExtendida).get(id)
            if persona_ext:
                persona_ext.deleted_at = None
                session.flush()

            else:
                raise ValueError (f"No se encontró ese id: {id}")

        except Exception as e:
            session.rollback()
            raise e

        finally:
            if cerrar:
                session.close()
                session.commit()



    