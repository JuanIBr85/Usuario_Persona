from typing import Any, Callable, List, Optional, Union
from marshmallow import Schema
from sqlalchemy import exists, and_
from app.database.session import SessionLocal
from sqlalchemy.orm import Session, Query

from app.interfaces.service_base_interface import IServicioBase
from app.models.base_model import Base

"""
    Clase base para servicios CRUD reutilizables.

    Esta clase implementa operaciones genéricas para cualquier modelo SQLAlchemy y esquema Marshmallow.
    Está diseñada para ser heredada o instanciada directamente con un modelo y un esquema.

    Métodos:
        - get_all: Obtener todos los registros del modelo.
        - get_by_id: Buscar un registro por su ID.
        - exist: Verificar si existe un registro (no eliminado lógicamente).
        - create: Crear un nuevo registro a partir de datos validados.
        - update: Modificar un registro existente.
        - delete: Eliminar un registro (soft delete por defecto).
        - query: Ejecutar una consulta personalizada sobre el modelo.
        - validate: Validar datos de entrada con el esquema.
"""


class ServicioBase(IServicioBase):
    def __init__(self, model: Any, schema: Schema):
        """
        Inicializa la clase base con un modelo y un esquema de validación.

        Args:
            model (Any): Clase del modelo SQLAlchemy.
            schema (Schema): Esquema de Marshmallow asociado al modelo.
        """
        self.schema: Schema = schema
        self.model = model

    def get_all(self, session: Optional[Session] = None) -> Union[dict, list[dict]]:
        """
        Obtiene todos los registros del modelo.

        Args:
            session (Session, opcional): Sesión SQLAlchemy activa.

        Returns:
            list[dict]: Lista de registros serializados.
        """
        model = self.model
        return self._run_with_session(lambda s: s.query(model).all(), session) or []

    def get_by_id(self, id: int, session: Optional[Session] = None) -> Union[dict, None]:
        """
        Obtiene un registro por su ID.

        Args:
            id (int): ID del registro.
            session (Session, opcional): Sesión activa.

        Returns:
            dict | None: Registro serializado o None si no existe.
        """
        model = self.model
        return self._run_with_session(lambda s: s.query(model).get(id), session)

    def exist(self, id: int, session: Optional[Session] = None) -> bool:
        """
        Verifica si existe un registro sin estar eliminado lógicamente.

        Args:
            id (int): ID a buscar.
            session (Session, opcional): Sesión activa.

        Returns:
            bool: True si existe y no está eliminado, False en caso contrario.
        """
        model = self.model
        pk_column = list(model.__mapper__.primary_key)[0]
        return self._run_with_session(
            lambda s: s.query(exists().where(and_(pk_column == id, model.deleted_at.is_(None)))).scalar(),
            session,
            is_scalar=True
        )

    def create(self, session: Optional[Session], data: Any) -> Any:
        """
        Crea un nuevo registro a partir de los datos validados.

        Args:
            session (Session): Sesión activa.
            data (dict): Datos del nuevo registro.

        Returns:
            Any: Instancia del modelo recién creada.
        """
        schema_data = self.schema.load(data)
        model_instance = self.model(**schema_data)

        def add(s: Session):
            s.add(model_instance)
            s.flush()  # flush para que tenga id antes del commit
            return model_instance

        return self._run_with_session(add, session=session, is_scalar=True)

    def update(self, id: int, data: Any, session: Optional[Session] = None) -> Union[dict, None]:
        """
        Actualiza un registro existente con nuevos datos.

        Args:
            id (int): ID del registro a actualizar.
            data (dict): Nuevos datos.
            session (Session, opcional): Sesión activa.

        Returns:
            dict | None: Objeto actualizado o None si no existe.
        """
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
        """
        Elimina un registro por ID.

        Args:
            id (int): ID del registro.
            soft (bool): Si True, realiza borrado lógico. Si False, elimina físicamente.
            session (Session, opcional): Sesión activa.

        Returns:
            None
        """
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
        """
        Permite ejecutar consultas personalizadas sobre el modelo.

        Args:
            query_callback (Callable): Función que recibe una query y devuelve un resultado.
            session (Session, opcional): Sesión activa.

        Returns:
            Any: Resultado de la consulta.
        """
        model = self.model

        def _query(s: Session):
            return query_callback(s.query(model))

        return self._run_with_session(_query, session=session)

    def validate(self, data: Any, partial: bool = False) -> tuple[bool, List]:
        """
        Valida datos según el esquema del servicio.

        Args:
            data (dict | list): Datos a validar.
            partial (bool): Permite validación parcial.

        Returns:
            tuple[bool, list]: True y lista vacía si no hay errores, False y lista de errores si falla.
        """
        errors = self.schema.validate(data=data, many=isinstance(data, List), partial=partial)
        if errors:
            return False, errors
        return True, []

    def _run_with_session(self, session_callback: Callable[[Session], Any], session: Optional[Session] = None, is_scalar=False) -> Union[dict, list[dict], None]:
        """
        Ejecuta una operación con sesión, gestionando contexto si no se proporciona una.

        Args:
            session_callback (Callable): Función que recibe la sesión y realiza la lógica.
            session (Session, opcional): Sesión existente o None.
            is_scalar (bool): Si True, no se aplica serialización con schema.

        Returns:
            Resultado de la operación, serializado si corresponde.
        """
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
