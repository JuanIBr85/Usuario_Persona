from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session, sessionmaker, scoped_session
from sqlalchemy.sql import Select
from flask_jwt_extended import JWTManager
from app.models.base_model import BaseModel
from config import SQLALCHEMY_DATABASE_URI


engine = create_engine(SQLALCHEMY_DATABASE_URI, echo=True, future=True)
SessionLocal = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))

jwt = JWTManager()

# Consulta que incluye registros eliminados lógicamente
#query = session.query(Persona).execution_options(skip_soft_delete_filter=True)

# Interceptar consultas para aplicar el filtro global para el borrado logico
@event.listens_for(Session, "do_orm_execute")
def _add_soft_delete_filter(execute_context):
    # Verifica si la consulta tiene la opción personalizada para desactivar el filtro
    if execute_context.execution_options.get("skip_soft_delete_filter", False):
        return  # No aplica el filtro si la opción está activada
    
    if execute_context.is_select:
        query = execute_context.statement
        if isinstance(query, Select):  # Verifica si es una consulta basada en Select
            # Aplica el filtro global a todas las consultas
            for entity in query.get_final_froms():
                if hasattr(entity.entity_namespace, "deleted_at"):
                    query = query.where(entity.entity_namespace.deleted_at.is_(None))
            execute_context.statement = query