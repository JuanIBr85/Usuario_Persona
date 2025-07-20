from typing import Any, Callable, List
from datetime import datetime, timezone
from marshmallow import Schema, EXCLUDE
from sqlalchemy import exists, and_
from app.extensions import SessionLocal
from sqlalchemy.orm import Session, Query

from app.models.base_model import BaseModel


# Servicio generico, permite manipular un CRUD basico de cualquier tabla de la base de datos
class ServicioBase:
    def __init__(self, model: Any, schema: Schema):
        # Guarda el modelo y el esquema (schema) para usarlos en los métodos
        self.schema: Schema = schema
        self.model = model

    def get_all(self, not_dump: bool = False) -> dict | list[dict] | list[Any]:
        # Obtiene todos los registros del modelo
        model = self.model

        # return self._run_with_session(lambda session: session.query(model).execution_options(skip_soft_delete_filter=True).all()) or []
        return (
            self._run_with_session(
                lambda session: session.query(model).all(), not_dump=not_dump
            )
            or []
        )

    def dump(self, model, args):
        return self.schema.dump(model, **args)

    def get_by_id(self, id: int, not_dump: bool = False) -> dict | None:
        # Busca un registro por su ID
        model = self.model
        return self._run_with_session(
            lambda session: session.query(model).get(id), not_dump=not_dump
        )

    def exist(self, id: int) -> bool:
        model = self.model
        # Obtenemos la columna de la clave primaria de forma dinámica.
        pk_column = list(model.__mapper__.primary_key)[0]
        return self._run_with_session(
            lambda session: session.query(
                exists().where(and_(pk_column == id, model.deleted_at.is_(None)))
            ).scalar(),
            not_dump=True,
        )

    def create(
        self, data: Any, not_dump: bool = False, ignore_schema=False
    ) -> dict | None:
        # Crea un nuevo registro con los datos recibidos
        if not ignore_schema:
            schema = self.schema.load(data)
        else:
            schema = data
        model = self.model(**schema)

        def add(session: Session) -> Any:
            session.add(model)
            session.commit()  # Guarda los cambios en la base de datos
            session.refresh(model)  # Actualiza el modelo con los datos de la BD
            return model

        return self._run_with_session(add, not_dump=not_dump)

    def update(
        self, id: int, data: Any, not_dump: bool = False, ignore_schema=False
    ) -> dict | None:
        # Actualiza un registro existente
        if not ignore_schema:
            schema = self.schema.load(data, partial=True, unknown=EXCLUDE)
        else:
            schema = data

        def merge(session: Session) -> Any:
            # Buscar el registro existente
            instance = session.get(self.model, id)
            if not instance:
                return None

            # Actualizar sólo los campos que vienen en data
            for key, value in schema.items():
                setattr(instance, key, value)

            # Forzar la actualización del campo updated_at
            instance.updated_at = datetime.now(timezone.utc)

            session.commit()
            session.refresh(instance)
            return instance

        return self._run_with_session(merge, not_dump=not_dump)

    def delete(self, id: int, soft: bool = True, not_dump: bool = False) -> None:
        # Elimina un registro por su ID
        model = self.model

        def remove(session: Session) -> None:
            entity: BaseModel = session.query(model).get(id)
            if soft:
                entity.set_delete()
            else:
                session.delete(entity)
            session.commit()
            return True

        self._run_with_session(remove, not_dump=not_dump)

    def query(
        self, query_callback: Callable[[Query[Any]], Any], not_dump: bool = False
    ) -> Any:
        # Permite realizar consultas personalizadas usando un callback
        model = self.model

        def _query(session: Session):
            return query_callback(session.query(model))

        return self._run_with_session(_query, not_dump=not_dump)

    def validate(self, data: Any, partial: bool = False) -> tuple[bool, List]:
        # Valida los datos contra el esquema
        errors = self.schema.validate(
            data=data, many=isinstance(data, List), partial=partial
        )

        if errors:
            return False, errors

        return True, []

    def _run_with_session(
        self, session_callback: Callable[[Session], Any], not_dump=False
    ) -> dict | list[dict] | None | Any:
        # Maneja la sesión de base de datos, ejecuta una operación y la convierte a dict
        session = SessionLocal()
        try:
            enitites = session_callback(session)

            if not enitites:
                return None

            if not_dump:
                return enitites
            else:
                return self.schema.dump(
                    enitites, many=isinstance(enitites, (list, set, tuple))
                )

        except Exception as error:
            session.rollback()
            # El error es manejado por el controlador
            raise error

        finally:
            session.close()
