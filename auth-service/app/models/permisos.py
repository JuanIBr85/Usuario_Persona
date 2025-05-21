from sqlalchemy import Column, Integer, String,DateTime,ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base
from datetime import datetime, timezone


class Permiso(Base):
    __tablename__ = 'permiso'

    id_permiso = Column(Integer, primary_key=True)
    nombre_permiso = Column(String, nullable=False)

    created_at=Column(DateTime, default=datetime.now(timezone.utc))
    updated_at=Column(DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))
    deleted_at=Column(DateTime, nullable=True)

    roles = relationship("RolPermiso", back_populates="permiso")


class RolPermiso(Base):
    __tablename__ = 'rol_permiso'

    id_rol_permiso = Column(Integer, primary_key=True)
    rol_id = Column(Integer, ForeignKey('rol.id_rol'), nullable=False)
    permiso_id = Column(Integer, ForeignKey('permiso.id_permiso'), nullable=False)

    created_at=Column(DateTime, default=datetime.now(timezone.utc))
    updated_at=Column(DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))
    deleted_at=Column(DateTime, nullable=True)

    rol = relationship("Rol", back_populates="permisos")
    permiso = relationship("Permiso", back_populates="roles")