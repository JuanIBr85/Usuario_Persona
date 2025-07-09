from sqlalchemy import Column, Integer, String,DateTime,ForeignKey,Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone,timedelta
from app.models.base_model import Base


class Usuario(Base):
    """
    Modelo principal de autenticación. Representa a un usuario del sistema.

    Atributos:
        id_usuario (int): ID primario.
        nombre_usuario (str): Nombre visible o username.
        email_usuario (str): Email único del usuario.
        email_verificado (bool): True si el email fue validado.
        password (str): Contraseña hasheada.
        eliminado (bool): Borrado lógico.
        deleted_at (datetime): Fecha de eliminación lógica.
        created_at, updated_at: Timestamps de auditoría.
        password_changed_at (datetime): Último cambio de contraseña.
        password_expira_en (datetime): Fecha de expiración programada.

    Relaciones:
        roles: Relación M:N con Rol a través de RolUsuario.
        logs: Historial de actividad del usuario.
        password_logs: Historial de contraseñas anteriores.
        dispositivos: Lista de dispositivos confiables asociados.
    """
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

    roles = relationship("RolUsuario", back_populates="usuario")
    logs = relationship("UsuarioLog", back_populates="usuario")
    password_logs = relationship("PasswordLog", back_populates="usuario")
    dispositivos = relationship("DispositivoConfiable", back_populates="usuario", cascade="all, delete-orphan")

    def marcar_email_verificado(self):
        """Marca el email como verificado."""
        self.email_verificado = True

    def set_delete(self):
        """Marca al usuario como eliminado lógicamente."""
        self.eliminado = True
        self.deleted_at = datetime.now(timezone.utc)

class UsuarioLog(Base):
    """
    Modelo de log de acciones del usuario (login, logout, etc.).

    Atributos:
        id_log (int): ID del log.
        logged_at (datetime): Momento en que ocurrió la acción.
        accion (str): Tipo de acción (ej: 'login', 'logout').
        detalles (str): Descripción adicional.
        usuario_id (int): Usuario relacionado.
    """
    __tablename__ = 'usuario_logs'

    id_log = Column(Integer, primary_key=True)
    logged_at = Column(DateTime, default=datetime.now(timezone.utc))
    accion = Column(String)
    detalles = Column(String)
    usuario_id = Column(Integer, ForeignKey('usuario.id_usuario'), nullable=False)

    usuario = relationship("Usuario", back_populates="logs")


class PasswordLog(Base):
    """
    Historial de contraseñas de un usuario, útil para políticas de seguridad.

    Atributos:
        id_password_log (int): ID del registro.
        usuario_id (int): Usuario relacionado.
        password (str): Contraseña anterior hasheada.
        updated_at (datetime): Fecha del cambio.
    """
    __tablename__ = 'password_logs'

    id_password_log = Column(Integer, primary_key=True)
    usuario_id = Column(Integer, ForeignKey('usuario.id_usuario'), nullable=False)
    password = Column(String, nullable=False)
    updated_at = Column(DateTime)

    usuario = relationship("Usuario", back_populates="password_logs")

    