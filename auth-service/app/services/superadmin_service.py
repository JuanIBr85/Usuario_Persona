from app.models.usuarios import Usuario
from app.models.rol import Rol, RolUsuario
from app.models.permisos import Permiso, RolPermiso
from sqlalchemy.orm import Session
from werkzeug.security import generate_password_hash
from datetime import datetime, timezone


class SuperAdminService:

    def crear_usuario_con_rol(self, session: Session, nombre: str, email: str, password: str, nombre_rol: str) -> dict:
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

        rol = session.query(Rol).filter_by(nombre_rol=nombre_rol).first()
        if not rol:
            raise ValueError(
                f"No se encontró el rol '{nombre_rol}' en la base.")

        relacion_rol = RolUsuario(
            id_usuario=nuevo_usuario.id_usuario,
            id_rol=rol.id_rol
        )
        session.add(relacion_rol)

        session.commit()

        return {
            "mensaje": f"Admin {nombre} creado exitosamente.",
            "id_usuario": nuevo_usuario.id_usuario
        }

    def asignar_permisos_rol(self, session: Session, rol_id: int, permisos: list) -> dict:
        rol = session.query(Rol).filter_by(id_rol=rol_id).first()
        if not rol:
            raise ValueError("No se encontró el rol.")

        for nombre_permiso in permisos:
            permiso = session.query(Permiso).filter_by(
                nombre_permiso=nombre_permiso).first()
        if not permiso:
            raise ValueError(f"Permiso '{nombre_permiso}' no encontrado.")

        existe = session.query(RolPermiso).filter_by(
            id_rol=rol.id_rol,
            permiso_id=permiso.id_permiso
        ).first()
        if not existe:
            session.add(RolPermiso(id_rol=rol.id_rol,
                        permiso_id=permiso.id_permiso))

        session.commit()

        return {
            "mensaje": f"Permisos asignados al rol {rol.nombre_rol} exitosamente."
        }

    def modificar_admin(self, session: Session, usuario_id: int, datos: dict) -> dict:
        usuario = session.query(Usuario).filter_by(
            id_usuario=usuario_id).first()
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

    def crear_rol(self, session: Session, nombre_rol: str) -> dict:
        rol_existente = session.query(Rol).filter_by(
            nombre_rol=nombre_rol).first()
        if rol_existente:
            raise ValueError(f"Ya existe un rol con el nombre '{nombre_rol}'.")

        nuevo_rol = Rol(nombre_rol=nombre_rol)
        session.add(nuevo_rol)
        session.commit()

        return {
            "mensaje": f"Rol '{nombre_rol}' creado correctamente.",
            "id_rol": nuevo_rol.id_rol
        }

    # ==========
    # Obtener roles ## Esta función es nueva Jun 6
    # ==========
    def obtener_roles(self, session: Session) -> dict:
        try:
            roles = session.query(Rol).filter(Rol.deleted_at == None).all()
            resultado = []
            for rol in roles:
                permisos = [
                    rp.permiso.nombre_permiso
                    for rp in rol.permisos
                    if rp.permiso and rp.permiso.deleted_at is None
                ]
                resultado.append({
                    "id_rol": rol.id_rol,
                    "nombre_rol": rol.nombre_rol,
                    "permisos": permisos
                })
            return {"roles": resultado}
        except Exception as e:
            raise Exception(f"Error al obtener roles: {str(e)}")

    # ==========
    # ==========


