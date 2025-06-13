from sqlalchemy import Column, Integer, String,DateTime,ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone,timedelta
from app.models.base_model import Base

class Usuario(Base):
    __tablename__ = 'usuario'
    __table_args__ = {'sqlite_autoincrement': True}  #---> buscar forma de hacerlo sobre id_usuario/ 
                                                     # esto solo hace que los integer y primary key se autoincrementen.
                                                     
    id_usuario = Column(Integer, primary_key=True)
    nombre_usuario = Column(String, nullable=False)
    email_usuario = Column(String, unique=True, nullable=False)
    email_verificado = Column(Integer, default=0)
    password = Column(String, nullable=False)
    persona_id = Column(Integer, nullable=True,default=None)
    
    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))
    deleted_at = Column(DateTime, nullable=True)
    password_changed_at = Column(DateTime, default=datetime.now(timezone.utc))    #este campo se actualiza cada vez q se cambia algo en las filas, cambiar a manual mas tarde
    password_expira_en = Column(DateTime, default=lambda: datetime.now(timezone.utc) + timedelta(days=365)) #agregar fecha de expiracion predeterminada - datetime.now(timezone.utc) + timedelta(days=365)

    # Definir las relaciones y acomodar los nombres segun la tabla Entidad-relacion
    #persona = relationship("Persona") ---> solo comentado para poder hacer desarrollo hasta que podamos usar la tabla persona.
    roles = relationship("RolUsuario", back_populates="usuario")
    logs = relationship("UsuarioLog", back_populates="usuario")
    password_logs = relationship("PasswordLog", back_populates="usuario")
    dispositivos = relationship("DispositivoConfiable", back_populates="usuario", cascade="all, delete-orphan")

    def marcar_email_verificado(self):
        self.email_verificado = True

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

    