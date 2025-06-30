from app.models.usuarios import Usuario
from app.models.rol import Rol, RolUsuario
from app.models.permisos import Permiso, RolPermiso
from sqlalchemy.orm import Session
from werkzeug.security import generate_password_hash
from datetime import datetime, timezone


class SuperAdminService:

    # ============================================
    # Crea un usuario nuevo con un rol específico
    # ============================================
    def crear_usuario_con_rol(self, session: Session, nombre: str, email: str, password: str, nombre_rol: str) -> dict:
        # Verifica si ya existe un usuario con el mismo email
        if session.query(Usuario).filter_by(email_usuario=email).first():
            raise ValueError("Ya existe un usuario con ese email.")

        # Hashea la contraseña
        hashed_password = generate_password_hash(password)

        # Crea el nuevo usuario
        nuevo_usuario = Usuario(
            nombre_usuario=nombre,
            email_usuario=email,
            password=hashed_password
        )
        session.add(nuevo_usuario)
        session.flush()  # obtener id

        # Busca el rol a asignar
        rol = session.query(Rol).filter_by(nombre_rol=nombre_rol).first()
        if not rol:
            raise ValueError(
                f"No se encontró el rol '{nombre_rol}' en la base.")
        # Crea la relación entre el usuario y el rol
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
    # ====================================================
    # Asigna permisos a un rol, reemplazando los actuales
    # ====================================================

    def asignar_permisos_rol(self, session: Session, rol_id: int, permisos: list) -> dict:
        rol = session.query(Rol).filter_by(id_rol=rol_id).first()
        if not rol:
            raise ValueError("No se encontró el rol.")

        # Obtener permisos actuales asociados al rol
        permisos_actuales = {
            rp.permiso.nombre_permiso: rp
            for rp in session.query(RolPermiso).filter_by(id_rol=rol_id).all()
        }

        permisos_nuevos_set = set(permisos)

        # Quitar permisos que ya no están en la lista nueva
        for nombre_permiso in list(permisos_actuales.keys()):
            if nombre_permiso not in permisos_nuevos_set:
                session.delete(permisos_actuales[nombre_permiso])

        # Agregar permisos nuevos que no estén asignados
        permisos_a_agregar = permisos_nuevos_set - \
            set(permisos_actuales.keys())
        permisos_objs = session.query(Permiso).filter(
            Permiso.nombre_permiso.in_(permisos_a_agregar)
        ).all()

        for permiso_obj in permisos_objs:
            rp = RolPermiso(id_rol=rol_id, permiso_id=permiso_obj.id_permiso)
            session.add(rp)

        session.commit()

        return {
            "mensaje": f"Permisos asignados correctamente a {rol.nombre_rol}."
        }
    # =====================================================================
    # Modifica los datos de un usuario, y sus roles si vienen en los datos
    # =====================================================================

    def modificar_usuario_con_rol(self, session: Session, usuario_id: int, datos: dict) -> dict:
        usuario = session.query(Usuario).filter_by(
            id_usuario=usuario_id).first()
        if not usuario:
            raise ValueError("No se encontró el usuario.")

        # Modificar atributos del usuario (excepto los roles)
        for key, value in datos.items():
            if key != "roles" and hasattr(usuario, key):
                setattr(usuario, key, value)

        usuario.updated_at = datetime.now(timezone.utc)

        # Si vienen roles, actualizarlos
        if "roles" in datos:
            # Eliminar roles actuales del usuario
            session.query(RolUsuario).filter_by(id_usuario=usuario_id).delete()

        # Agrega nuevos roles
        for rol_id in datos["roles"]:
            rol = session.query(Rol).filter_by(id_rol=rol_id).first()
            if not rol:
                raise ValueError(f"Rol con ID '{rol_id}' no encontrado.")
            nueva_relacion = RolUsuario(
                id_usuario=usuario_id, id_rol=rol.id_rol)
            session.add(nueva_relacion)

        session.commit()

        return {
            "mensaje": f"Usuario {usuario.nombre_usuario} modificado exitosamente."
        }
    # =================================================
    # Crea un nuevo rol, si no existe con anterioridad
    # =================================================

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

    # =========================
    # Devuelve todos los roles
    # =========================
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

    # =================================
    # Realiza borrado lógico de un rol
    # =================================
    def borrar_rol(self, session: Session, rol_id: int) -> dict:
        rol = session.query(Rol).filter_by(
            id_rol=rol_id, deleted_at=None).first()
        if not rol:
            raise ValueError("No se encontró el rol o ya fue eliminado.")

        #  borrado lógico:
        rol.deleted_at = datetime.now(timezone.utc)

        session.commit()
        return {
            "mensaje": f"Rol '{rol.nombre_rol}' eliminado correctamente."
        }
    # =============================
    # Devuelve todos los permisos
    # =============================

    def obtener_permisos(self, session: Session) -> dict:
        try:
            permisos = session.query(Permiso).filter(
                Permiso.deleted_at == None).all()
            resultado = [
                {
                    "id_permiso": permiso.id_permiso,
                    "nombre_permiso": permiso.nombre_permiso,
                    # "descripcion": permiso.descripcion
                }
                for permiso in permisos
            ]
            return {"permisos": resultado}
        except Exception as e:
            raise Exception(f"Error al obtener permisos: {str(e)}")

    # =============================
    # Devuelve todos los usuarios
    # =============================
    def obtener_usuarios(self, session):
        usuarios = session.query(Usuario).all()
        resultado = []
        for u in usuarios:
            # Obtener roles asociados (nombres)
            roles = [ru.rol.nombre_rol for ru in u.roles if ru.rol and not ru.rol.deleted_at]

            # Obtener permisos únicos de todos los roles del usuario
            permisos = list({
                permiso_rel.permiso.nombre_permiso
                for ru in u.roles if ru.rol and not ru.rol.deleted_at
                for permiso_rel in ru.rol.permisos if permiso_rel.permiso and not permiso_rel.permiso.deleted_at
            })

            # Obtener ids de roles
            roles_ids = [ru.rol.id_rol for ru in u.roles if ru.rol and not ru.rol.deleted_at]

            usuario_dict = {
                "id": u.id_usuario,
                "nombre_usuario": u.nombre_usuario,
                "email_usuario": u.email_usuario,
                "email_verificado": u.email_verificado,
                "created_at": u.created_at.isoformat() if u.created_at else None,
                "updated_at": u.updated_at.isoformat() if u.updated_at else None,
                "deleted_at": u.deleted_at.isoformat() if u.deleted_at else None,
                "password_changed_at": u.password_changed_at.isoformat() if u.password_changed_at else None,
                "password_expira_en": u.password_expira_en.isoformat() if u.password_expira_en else None,
                "roles": roles,
                "roles_ids": roles_ids,     
                "permisos": permisos,
            }
            resultado.append(usuario_dict)
        return resultado

  # =========================
  # =========================
