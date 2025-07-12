from app.database.session import SessionLocal
from app.models.rol import Rol  
from app.models.permisos import Permiso, RolPermiso
from sqlalchemy.orm import Session
from common.services.component_service_api import ComponentServiceApi

def actualizar_roles():
    """
    Sincroniza los roles y permisos desde el servicio de componentes.

    Esta función realiza las siguientes acciones:
    - Consulta el servicio `component-service` para obtener la estructura actual de roles y permisos.
    - Crea nuevos permisos si no existen.
    - Crea nuevos roles si no existen.
    - Restaura roles previamente eliminados.
    - Elimina todos los permisos actuales de cada rol (excepto `superadmin`).
    - Asigna los nuevos permisos a cada rol según la configuración recibida.
    - Se asegura de mantener actualizado el rol `superadmin` con todos los permisos (esto se gestiona en `actualizar_permisos`).

    Notas:
        - El rol `superadmin` no se modifica aquí, ya que posee automáticamente todos los permisos.
        - Se utiliza SQLAlchemy ORM y operaciones en bloque para eficiencia.

    Raise:
        Exception: Si ocurre un error inesperado durante la sincronización.
    """
    response = ComponentServiceApi.internal_services_recolect_perms()
    db = SessionLocal()
    try:
        if response.status_code == 200:
            data = response.json()["data"]
            roles_data: dict[str, list[str]] = data["roles"]
            permisos: list[str] = data["permissions"]
            #Actualizo la lista de permisos
            actualizar_permisos(db, permisos)
            
            # Obtener todos los roles existentes
            roles_existentes = {
                r.nombre_rol: r
                for r in db.query(Rol)
                .filter(Rol.nombre_rol.in_(roles_data.keys()))
                .all()
            }

            # Crear roles nuevos
            nuevos_roles = [
                Rol(nombre_rol=nombre_rol)
                for nombre_rol in roles_data
                if nombre_rol not in roles_existentes
            ]

            # Crear nuevos roles que no existen
            db.bulk_save_objects(nuevos_roles)
            db.flush()
            print(f"[✓] Roles actualizados correctamente.")

            # Actualizo el diccionario de roles
            roles_existentes = {
                r.nombre_rol: r
                for r in db.query(Rol)
                .filter(Rol.nombre_rol.in_(roles_data.keys()))
                .all()
            }

            # Sincronizar permisos para cada rol
            for nombre_rol, permisos_rol in roles_data.items():
                #El super admin es un rol especial, y posee todos los permisos
                #Por lo tanto, no se le asignan permisos en este punto
                if nombre_rol == "superadmin":
                    continue

                rol = roles_existentes.get(nombre_rol)
                if not rol:
                    continue

                # Si el rol esta borrado se restaura
                rol.deleted_at = None
                db.flush()

                # Obtener permisos actuales del rol a través de la relación
                permisos_actuales = {
                    rp.permiso.nombre_permiso: rp 
                    for rp in rol.permisos
                }

                # Elimino todos los permiso del rol
                for permiso in permisos_actuales.values():
                    db.delete(permiso)
                db.flush()

                # Obtengo los permisos de la DB para el rol
                permisos_rol_db = {
                    p.nombre_permiso: p
                    for p in db.query(Permiso)
                    .filter(Permiso.nombre_permiso.in_(permisos_rol))
                    .all()
                }


                # Agrego los permisos al rol
                for permiso in permisos_rol_db.values():
                    db.add(RolPermiso(id_rol=rol.id_rol, permiso_id=permiso.id_permiso))
                db.flush()
               

            db.commit()
        else:
            print(f"[x] No se pudo obtener el listado de roles")
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"[x] Error al actualizar roles: {e}")
        db.rollback()
    finally:
        db.close()

def actualizar_permisos(db: Session, permisos: list[str]):
    """
    Agrega nuevos permisos a la base de datos si no existen y los asigna al rol `superadmin`.

    Esta función:
    - Compara la lista de permisos actuales en base de datos con la lista recibida.
    - Inserta los permisos faltantes.
    - Asigna automáticamente los permisos nuevos al rol `superadmin`, sin duplicar relaciones.

    Args:
        db (Session): Objeto de sesión activa de SQLAlchemy.
        permisos (list[str]): Lista de nombres de permisos a asegurar en base de datos.

    Raise:
        Exception: En caso de error durante la inserción o asignación de permisos.
    """
    try:
        # Obtener todos los permisos existentes de una s|ola vez
        permisos_existentes = {
            p.nombre_permiso: p
            for p in db.query(Permiso)
            .filter(Permiso.nombre_permiso.in_(permisos))
            .all()
        }

        # Filtrar solo los permisos que no existen
        nuevos_permisos = [
            Permiso(nombre_permiso=nombre)
            for nombre in permisos
            if nombre not in permisos_existentes
        ]

        # Si no hay nuevos permisos, no hago nada
        if len(nuevos_permisos) == 0:
            return

        # Insertar todos los nuevos permisos de una sola vez
        if nuevos_permisos:
            db.bulk_save_objects(nuevos_permisos)
            db.flush()

            # Obtener los nombres de los permisos recién insertados
            nombres_permisos = [p.nombre_permiso for p in nuevos_permisos]

            # Consultar los permisos recién insertados para obtener sus IDs
            permisos_guardados = (
                db.query(Permiso)
                .filter(Permiso.nombre_permiso.in_(nombres_permisos))
                .all()
            )

            # Actualizar los permisos del rol de superadmin
            rol = db.query(Rol).filter_by(nombre_rol="superadmin").first()
            for permiso in permisos_guardados:
                # Verificar si la relación ya existe
                existe = (
                    db.query(RolPermiso)
                    .filter_by(id_rol=rol.id_rol, permiso_id=permiso.id_permiso)
                    .first()
                )
                if not existe:
                    db.add(
                        RolPermiso(id_rol=rol.id_rol, permiso_id=permiso.id_permiso)
                    )
            db.flush()

        print("[✓] Permisos actualizados correctamente.")
    except Exception as e:
        print(f"[x] Error al actualizar permisos: {e}")
        raise e

