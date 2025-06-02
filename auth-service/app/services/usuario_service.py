from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.orm import Session
from app.models.usuarios import Usuario, PasswordLog, UsuarioLog
from app.models.rol import RolUsuario,Rol
from app.services.rol import get_rol_por_nombre
from app.utils.jwt import crear_token_acceso
from app.schemas.usuarios_schema import UsuarioInputSchema
from marshmallow import ValidationError
from app.services.servicio_base import ServicioBase
from app.models.permisos import Permiso
from app.models.rol import RolPermiso
from app.utils.email import enviar_email_verificacion

class UsuarioService(ServicioBase):
    def __init__(self):
        super().__init__(model=Usuario, schema=UsuarioInputSchema())

    def registrar_usuario(self, session: Session, data: dict) -> dict:
        try:
            data_validada = self.schema.load(data)
        except ValidationError as e:
            raise ValueError(f"Datos inválidos: {e.messages}")

        if session.query(Usuario).filter(
            (Usuario.nombre_usuario == data_validada['nombre_usuario']) |
            (Usuario.email_usuario == data_validada['email_usuario'])
        ).first():
            raise ValueError("El nombre de usuario o el email ya están registrados")

        password_hash = generate_password_hash(data_validada['password'])
        data_validada["password"] = password_hash

        nuevo_usuario = self.create(session, data_validada)
        session.flush()
        enviar_email_verificacion(nuevo_usuario)

        rol_por_defecto = get_rol_por_nombre(session, "usuario")
        if not rol_por_defecto:
            raise ValueError("Rol por defecto no encontrado")

        session.add(RolUsuario(
            id_usuario=nuevo_usuario.id_usuario,
            id_rol=rol_por_defecto.id_rol
        ))

        session.add(PasswordLog(
            usuario_id=nuevo_usuario.id_usuario,
            password=password_hash,
            updated_at=datetime.now(timezone.utc)
        ))

        session.add(UsuarioLog(
            usuario_id=nuevo_usuario.id_usuario,
            accion="registro",
            detalles="El usuario se registró correctamente"
        ))

        return {"mensaje": "Usuario registrado correctamente"}


    def login_usuario(self, session: Session, email: str, password: str) -> dict:



        usuario = session.query(Usuario).filter_by(email_usuario=email).first()
        if not usuario:
            raise ValueError("El email no está registrado.")

        if not usuario.email_verificado:
            raise ValueError("Debe verificar su correo electrónico para poder iniciar sesión.")
        
        if not check_password_hash(usuario.password, password):
            raise ValueError("La contraseña es incorrecta.")

        # Obtener el rol del usuario
        rol_usuario = session.query(Rol).join(RolUsuario).filter(RolUsuario.id_usuario == usuario.id_usuario).first()
        rol_nombre = rol_usuario.nombre_rol if rol_usuario else "sin_rol"

        # Obtener los permisos asociados al rol
        permisos_query = (
            session.query(Permiso.nombre_permiso)
            .join(RolPermiso, Permiso.id_permiso == RolPermiso.permiso_id)
            .filter(RolPermiso.id_rol == rol_usuario.id_rol)
            .all()
        )
        permisos_lista = [p.nombre_permiso for p in permisos_query]

        # Crear token con permisos incluidos
        token = crear_token_acceso(usuario.id_usuario, email, rol_nombre, permisos_lista)

        # Registrar log de login
        session.add(UsuarioLog(
            usuario_id=usuario.id_usuario,
            accion="login",
            detalles="El usuario se logueó correctamente"
        ))

        return {
            "mensaje": "Login exitoso",
            "token": token,
            "usuario": {
                "id_usuario": usuario.id_usuario,
                "nombre_usuario": usuario.nombre_usuario,
                "email_usuario": usuario.email_usuario,
                "rol": rol_nombre,
                "permisos": permisos_lista
            }
        }
