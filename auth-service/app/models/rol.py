from sqlalchemy import Column, Integer, String,DateTime,ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.models.permisos import RolPermiso
from app.models.base_model import Base


class Rol(Base):
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
    __tablename__ = 'rol_usuario'

    id_rol_usuario = Column(Integer, primary_key=True)
    id_rol = Column(Integer, ForeignKey('rol.id_rol'), nullable=False)    # --> verificar como esta en el cuadro E-R y cambiar el cuadro
    id_usuario = Column(Integer, ForeignKey('usuario.id_usuario'), nullable=False)   # --> verificar como esta en el cuadro E-R y cambiar el cuadro

    created_at=Column(DateTime, default=datetime.now(timezone.utc))
    deleted_at=Column(DateTime, nullable=True)

    # Relaciones
    usuario = relationship("Usuario", back_populates="roles")
    rol = relationship("Rol", back_populates="usuarios")


