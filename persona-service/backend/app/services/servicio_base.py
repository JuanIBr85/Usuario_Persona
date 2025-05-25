from typing import Any, Callable, List
from marshmallow import Schema
from sqlalchemy import exists
from app.extensions import SessionLocal
from sqlalchemy.orm import Session, Query

from app.interfaces.service_base_interface import IServicioBase
from app.models.base_model import BaseModel

#Servicio generico, permite manipular un CRUD basico de cualquier tabla de la base de datos
class ServicioBase(IServicioBase):
    def __init__(self, model: Any, schema: Schema):
        # Guarda el modelo y el esquema (schema) para usarlos en los métodos
        self.schema: Schema = schema
        self.model = model
        
    def get_all(self) -> dict | list[dict]:
        # Obtiene todos los registros del modelo
        model = self.model
        return self._run_with_session(lambda session: session.query(model).all()) or []

    def get_by_id(self, id: int) -> dict | None:
        # Busca un registro por su ID
        model = self.model
        return self._run_with_session(lambda session: session.query(model).get(id))
    
    def exist(self, id: int) -> bool:
        model = self.model
        # Obtenemos la columna de la clave primaria de forma dinámica.
        pk_column = list(model.__mapper__.primary_key)[0]
        return self._run_with_session(
            lambda session: session.query(exists().where(pk_column == id)).scalar(),
            is_scalar=True
        )

    def create(self, data: Any) -> dict | None:
        # Crea un nuevo registro con los datos recibidos
        schema = self.schema.load(data)
        model = self.model(**schema)

        def add(session: Session) -> Any:
            session.add(model)
            session.commit()  # Guarda los cambios en la base de datos
            session.refresh(model)  # Actualiza el modelo con los datos de la BD
            return model

        return self._run_with_session(add)

    def update(self, id:int, data: Any) -> dict | None:
        # Actualiza un registro existente
        schema = self.schema.load(data, partial=True)

        def merge(session: Session) -> Any:
            # Buscar el registro existente
            instance = session.get(self.model, id)
            if not instance:
                return None
            
            # Actualizar sólo los campos que vienen en data
            for key, value in schema.items():
                setattr(instance, key, value)

            session.commit()
            session.refresh(instance)
            return instance

        return self._run_with_session(merge)

    def delete(self, id: int, soft:bool = True) -> None:
        # Elimina un registro por su ID
        model = self.model
        def remove(session: Session) -> None:
            entity:BaseModel = session.query(model).get(id)
            if soft:
                entity.set_delete()
            else:
                session.delete(entity)
            session.commit()

        self._run_with_session(remove)

    def query(self, query_callback: Callable[[Query[Any]], Any]) -> Any:
        # Permite realizar consultas personalizadas usando un callback
        model = self.model
        def _query(session: Session):
            return query_callback(session.query(model))
            
        return self._run_with_session(_query)

    def validate(self, data: Any, partial:bool=False) -> tuple[bool, List]:
        # Valida los datos contra el esquema
        errors = self.schema.validate(data=data, many=isinstance(data, List), partial=partial)

        if errors:
            return False, errors
        
        return True, []

    def _run_with_session(self, session_callback: Callable[[Session], Any], is_scalar=False) -> dict | list[dict] | None:
        # Maneja la sesión de base de datos, ejecuta una operación y la convierte a dict
        session = SessionLocal()
        try:
            enitites = session_callback(session)
            
            if not enitites: return None
            
            if is_scalar:
                return enitites
            else:
                return self.schema.dump(enitites, many=isinstance(enitites, (list, set, tuple)))
        
        except Exception as error:
            #El error es manejado por el controlador
            raise error
            
        finally:
            session.close()
