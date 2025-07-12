from sqlalchemy import Column, Integer, String,DateTime,ForeignKey
from sqlalchemy.orm import relationship
from app.models.base_model import Base
from datetime import datetime, timezone

class Permiso(Base):
    """
    Modelo que representa un permiso específico dentro del sistema.

    Atributos:
        id_permiso (int): Identificador único del permiso.
        nombre_permiso (str): Nombre o código del permiso (ej: 'crear_usuario', 'ver_logs').
        created_at, updated_at, deleted_at: Campos heredados para control de tiempo y eliminación lógica.

    Relaciones:
        roles (List[RolPermiso]): Relación con roles que tienen este permiso.
    """
    __tablename__ = 'permiso'

    id_permiso = Column(Integer, primary_key=True)
    nombre_permiso = Column(String, nullable=False)

    created_at=Column(DateTime, default=datetime.now(timezone.utc))
    updated_at=Column(DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))
    deleted_at=Column(DateTime, nullable=True)

    roles = relationship("RolPermiso", back_populates="permiso")


class RolPermiso(Base):
    """
    Modelo intermedio que representa la relación muchos a muchos entre roles y permisos.

    Atributos:
        id_rol_permiso (int): Identificador único de la relación.
        id_rol (int): ID del rol asociado.
        permiso_id (int): ID del permiso asociado.
        created_at, updated_at, deleted_at: Campos para auditoría y eliminación lógica.

    Relaciones:
        rol (Rol): Rol relacionado.
        permiso (Permiso): Permiso relacionado.
    """
    __tablename__ = 'rol_permiso'

    id_rol_permiso = Column(Integer, primary_key=True)
    id_rol = Column(Integer, ForeignKey('rol.id_rol'), nullable=False)
    permiso_id = Column(Integer, ForeignKey('permiso.id_permiso'), nullable=False)

    created_at=Column(DateTime, default=datetime.now(timezone.utc))
    updated_at=Column(DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))
    deleted_at=Column(DateTime, nullable=True)

    rol = relationship("Rol", back_populates="permisos")
    permiso = relationship("Permiso", back_populates="roles")