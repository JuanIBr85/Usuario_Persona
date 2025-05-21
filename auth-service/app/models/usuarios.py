from sqlalchemy import Column, Integer, String,DateTime,ForeignKey
from app.database.session import Base
from datetime import datetime, timezone

class Usuario(Base):
    __tablename__ = 'usuario'

    id_usuario = Column(Integer, primary_key=True)
    nombre_usuario = Column(String, nullable=False)
    email_usuario = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    persona_id = Column(Integer, ForeignKey('Persona.id_persona'), nullable=False)

    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))
    deleted_at = Column(DateTime, nullable=True)
    password_changed_at = Column(DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))
    password_expira_en = Column(DateTime) #agregar fecha de expiracion predeterminada

    # Definir las relaciones y acomodar los nombres segun la tabla Entidad-relacion
    persona = relationship("Persona")
    roles = relationship("RolUsuario", back_populates="usuario")
    logs = relationship("UsuarioLog", back_populates="usuario")
    password_logs = relationship("PasswordLog", back_populates="usuario")



class UsuarioLog(Base):
    __tablename__ = 'usuario_logs'

    id_log = Column(Integer, primary_key=True)
    logged_at = Column(DateTime)
    accion = Column(String)
    detalles = Column(String)
    usuario_id = Column(Integer, ForeignKey('usuario.id_usuario'), nullable=False)

    usuario = relationship("Usuario", back_populates="logs")


class PasswordLog(Base):
    __tablename__ = 'password_logs'

    id_password_log = Column(Integer, primary_key=True)
    usuario_id = Column(Integer, ForeignKey('usuario.id_usuario'), nullable=False)
    password = Column(String, nullable=False)
    updated_at = Column(DateTime)

    usuario = relationship("Usuario", back_populates="password_logs")

    