from sqlalchemy import Column, Integer, String,DateTime,ForeignKey,Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone,timedelta
from app.models.base_model import Base


class Usuario(Base):
    __tablename__ = 'usuario'
    __table_args__ = {'sqlite_autoincrement': True}

    id_usuario = Column(Integer, primary_key=True)
    nombre_usuario = Column(String, nullable=False)
    email_usuario = Column(String, unique=True, nullable=False)
    email_verificado = Column(Boolean, default=0)
    password = Column(String, nullable=False)

    eliminado = Column(Boolean, default=False)  # <-- campo para borrado lógico
    deleted_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))
    password_changed_at = Column(DateTime, default=datetime.now(timezone.utc))
    password_expira_en = Column(DateTime, default=lambda: datetime.now(timezone.utc) + timedelta(days=365))

    # Relaciones
    roles = relationship("RolUsuario", back_populates="usuario")
    logs = relationship("UsuarioLog", back_populates="usuario")
    password_logs = relationship("PasswordLog", back_populates="usuario")
    dispositivos = relationship("DispositivoConfiable", back_populates="usuario", cascade="all, delete-orphan")

    def marcar_email_verificado(self):
        self.email_verificado = True

    def set_delete(self):
        """Marca al usuario como eliminado lógicamente."""
        self.eliminado = True
        self.deleted_at = datetime.now(timezone.utc)

class UsuarioLog(Base):
    __tablename__ = 'usuario_logs'

    id_log = Column(Integer, primary_key=True)
    logged_at = Column(DateTime, default=datetime.now(timezone.utc))
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

    