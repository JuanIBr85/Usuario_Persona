from sqlalchemy import Column, Integer, String,DateTime,ForeignKey
from app.database.session import Base
from datetime import datetime, timezone

class Rol(Base):
    __tablename__ = 'rol'

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
    rol_id = Column(Integer, ForeignKey('rol.id_rol'), nullable=False)
    usuario_id = Column(Integer, ForeignKey('usuario.id_usuario'), nullable=False)

    created_at=Column(DateTime, default=datetime.now(timezone.utc))
    deleted_at=Column(DateTime, nullable=True)

    # Relaciones
    usuario = relationship("Usuario", back_populates="roles")
    rol = relationship("Rol", back_populates="usuarios")


