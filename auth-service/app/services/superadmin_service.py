from app.models.usuarios import Usuario
from app.models.rol import Rol, RolUsuario
from app.models.permisos import Permiso, RolPermiso
from sqlalchemy.orm import Session
from werkzeug.security import generate_password_hash
from datetime import datetime, timezone

class SuperAdminService:

    def crear_admin(self, session: Session, nombre: str, email: str, password: str) -> dict:
        if session.query(Usuario).filter_by(email_usuario=email).first():
            raise ValueError("Ya existe un usuario con ese email.")

        hashed_password = generate_password_hash(password)
        nuevo_usuario = Usuario(
            nombre_usuario=nombre,
            email_usuario=email,
            password=hashed_password
        )
        session.add(nuevo_usuario)
        session.flush()  # obtener id

        rol_admin = session.query(Rol).filter_by(nombre_rol="admin").first()
        if not rol_admin:
            raise ValueError("No se encontró el rol admin en la base.")

        relacion_rol = RolUsuario(
            id_usuario=nuevo_usuario.id_usuario,
            id_rol=rol_admin.id_rol
        )
        session.add(relacion_rol)

        session.commit()

        return {
            "mensaje": f"Admin {nombre} creado exitosamente.",
            "id_usuario": nuevo_usuario.id_usuario
        }
    
    def asignar_permisos_admin(self, session: Session, usuario_id: int, permisos: list) -> dict:
        usuario = session.query(Usuario).filter_by(id_usuario=usuario_id).first()

        if not usuario:
            raise ValueError("No se encontró el admin.")
        rol_admin = session.query(Rol).join(RolUsuario).filter(
            RolUsuario.id_usuario == usuario_id,
            Rol.nombre_rol == "admin"
        ).first()
        if not rol_admin:
            raise ValueError("El usuario no tiene rol admin asignado.")

        for nombre_permiso in permisos:
            permiso = session.query(Permiso).filter_by(nombre_permiso=nombre_permiso).first()
            if not permiso:
                raise ValueError(f"Permiso '{nombre_permiso}' no encontrado.")
            # Verificar si ya existe la relación
            existe = session.query(RolPermiso).filter_by(
                id_rol=rol_admin.id_rol,
                permiso_id=permiso.id_permiso
            ).first()
            if not existe:
                session.add(RolPermiso(id_rol=rol_admin.id_rol, permiso_id=permiso.id_permiso))

        session.commit()

        return {
            "mensaje": f"Permisos asignados al admin {usuario.nombre_usuario} exitosamente."
        }

    def modificar_admin(self, session: Session, usuario_id: int, datos: dict) -> dict:
        usuario = session.query(Usuario).filter_by(id_usuario=usuario_id).first()
        if not usuario:
            raise ValueError("No se encontró el admin.")

        for key, value in datos.items():
            if hasattr(usuario, key):
                setattr(usuario, key, value)
        usuario.updated_at = datetime.now(timezone.utc)

        session.commit()

        return {
            "mensaje": f"Admin {usuario.nombre_usuario} modificado exitosamente."
        }
