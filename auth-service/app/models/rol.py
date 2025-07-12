from sqlalchemy import Column, Integer, String,DateTime,ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.models.permisos import RolPermiso
from app.models.base_model import Base


class Rol(Base):
    """
    Modelo que representa un rol dentro del sistema.

    Atributos:
        id_rol (int): Identificador único del rol.
        nombre_rol (str): Nombre del rol (ej.: 'admin', 'cliente').
        created_at, updated_at, deleted_at: Timestamps heredados.

    Relaciones:
        usuarios (List[RolUsuario]): Usuarios que tienen este rol.
        permisos (List[RolPermiso]): Permisos asignados a este rol.
    """
    __tablename__ = 'rol'
    __table_args__ = {'sqlite_autoincrement': True}

    id_rol = Column(Integer, primary_key=True)
    nombre_rol = Column(String, nullable=False)

    created_at=Column(DateTime, default=datetime.now(timezone.utc))
    updated_at=Column(DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))
    deleted_at=Column(DateTime, nullable=True)

    usuarios = relationship("RolUsuario", back_populates="rol")
    permisos = relationship("RolPermiso", back_populates="rol")


class RolUsuario(Base):
    """
    Tabla intermedia que representa la relación entre usuarios y roles (M:N).

    Atributos:
        id_rol_usuario (int): Identificador único de la relación.
        id_rol (int): ID del rol asignado.
        id_usuario (int): ID del usuario que tiene el rol.
        created_at, deleted_at: Control de auditoría.

    Relaciones:
        usuario (Usuario): Usuario que posee este rol.
        rol (Rol): Rol asignado al usuario.
    """
    __tablename__ = 'rol_usuario'

    id_rol_usuario = Column(Integer, primary_key=True)
    id_rol = Column(Integer, ForeignKey('rol.id_rol'), nullable=False)    # --> verificar como esta en el cuadro E-R y cambiar el cuadro
    id_usuario = Column(Integer, ForeignKey('usuario.id_usuario'), nullable=False)   # --> verificar como esta en el cuadro E-R y cambiar el cuadro

    created_at=Column(DateTime, default=datetime.now(timezone.utc))
    deleted_at=Column(DateTime, nullable=True)

    
    usuario = relationship("Usuario", back_populates="roles")
    rol = relationship("Rol", back_populates="usuarios")


