from typing import Any, Callable, List, Optional, Union
from marshmallow import Schema
from sqlalchemy import exists, and_
from app.database.session import SessionLocal
from sqlalchemy.orm import Session, Query

from app.interfaces.service_base_interface import IServicioBase
from app.models.base_model import Base


class ServicioBase(IServicioBase):
    def __init__(self, model: Any, schema: Schema):
        self.schema: Schema = schema
        self.model = model

    def get_all(self, session: Optional[Session] = None) -> Union[dict, list[dict]]:
        model = self.model
        return self._run_with_session(lambda s: s.query(model).all(), session) or []

    def get_by_id(self, id: int, session: Optional[Session] = None) -> Union[dict, None]:
        model = self.model
        return self._run_with_session(lambda s: s.query(model).get(id), session)

    def exist(self, id: int, session: Optional[Session] = None) -> bool:
        model = self.model
        pk_column = list(model.__mapper__.primary_key)[0]
        return self._run_with_session(
            lambda s: s.query(exists().where(and_(pk_column == id, model.deleted_at.is_(None)))).scalar(),
            session,
            is_scalar=True
        )

    def create(self, session: Optional[Session], data: Any) -> Any:
        schema_data = self.schema.load(data)
        model_instance = self.model(**schema_data)

        def add(s: Session):
            s.add(model_instance)
            s.flush()  # flush para que tenga id antes del commit
            return model_instance

        return self._run_with_session(add, session=session, is_scalar=True)

    def update(self, id: int, data: Any, session: Optional[Session] = None) -> Union[dict, None]:
        schema_data = self.schema.load(data, partial=True)

        def merge(s: Session):
            instance = s.get(self.model, id)
            if not instance:
                return None
            for key, value in schema_data.items():
                setattr(instance, key, value)
            s.commit()
            s.refresh(instance)
            return instance

        return self._run_with_session(merge, session=session)

    def delete(self, id: int, soft: bool = True, session: Optional[Session] = None) -> None:
        model = self.model

        def remove(s: Session):
            entity: Base = s.query(model).get(id)
            if soft:
                entity.set_delete()
            else:
                s.delete(entity)
            s.commit()
            return True

        self._run_with_session(remove, session=session)

    def query(self, query_callback: Callable[[Query[Any]], Any], session: Optional[Session] = None) -> Any:
        model = self.model

        def _query(s: Session):
            return query_callback(s.query(model))

        return self._run_with_session(_query, session=session)

    def validate(self, data: Any, partial: bool = False) -> tuple[bool, List]:
        errors = self.schema.validate(data=data, many=isinstance(data, List), partial=partial)
        if errors:
            return False, errors
        return True, []

    def _run_with_session(self, session_callback: Callable[[Session], Any], session: Optional[Session] = None, is_scalar=False) -> Union[dict, list[dict], None]:
        if session is not None:
            entities = session_callback(session)
            if not entities:
                return None
            if is_scalar:
                return entities
            else:
                return self.schema.dump(entities, many=isinstance(entities, (list, set, tuple)))
        else:
            session_local = SessionLocal()
            try:
                entities = session_callback(session_local)
                if not entities:
                    return None
                if is_scalar:
                    return entities
                else:
                    return self.schema.dump(entities, many=isinstance(entities, (list, set, tuple)))
            except Exception as error:
                raise error
            finally:
                session_local.close()
