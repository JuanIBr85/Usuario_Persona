# ejecutar siempre con python -m app.script.seed_data

from app.database.session import SessionLocal
from app.models.rol import Rol
from app.models.permisos import Permiso, RolPermiso

# Roles base
roles_base = ["superadmin", "servicio_admin", "usuario", "invitado"]

# Permisos base (ejemplo genérico)
permisos_base = [
    "crear_usuario",
    "ver_usuario",
    "modificar_usuario",
    "eliminar_usuario",
    "crear_rol",
    "asignar_rol",
    "ver_roles",
    "ver_permisos"
]

# Permisos por rol
permisos_por_rol = {
    "superadmin": permisos_base,
    "servicio_admin": [
        "crear_usuario", "ver_usuario", "modificar_usuario", "asignar_rol", "ver_roles"
    ],
    "usuario": [
        "ver_usuario"
    ],
    "invitado": []
}

def seed():
    db = SessionLocal()

    # Crear permisos
    permisos_creados = {}
    for nombre_permiso in permisos_base:
        permiso = db.query(Permiso).filter_by(nombre_permiso=nombre_permiso).first()
        if not permiso:
            permiso = Permiso(nombre_permiso=nombre_permiso)
            db.add(permiso)
            db.commit()
            db.refresh(permiso)
        permisos_creados[nombre_permiso] = permiso

    # Crear roles y asignar permisos
    for nombre_rol in roles_base:
        rol = db.query(Rol).filter_by(nombre_rol=nombre_rol).first()
        if not rol:
            rol = Rol(nombre_rol=nombre_rol)
            db.add(rol)
            db.commit()
            db.refresh(rol)

        # Asignar permisos correspondientes
    for nombre_permiso in permisos_por_rol[nombre_rol]:
        permiso = permisos_creados[nombre_permiso]
        print("permiso:", permiso)
        print("permiso.id_permiso:", getattr(permiso, 'id_permiso', 'NO ENCONTRADO'))
        
        existe_relacion = db.query(RolPermiso).filter_by(
            id_rol=rol.id_rol,
            permiso_id=permiso.id_permiso  
        ).first()
        
        if not existe_relacion:
            db.add(RolPermiso(id_rol=rol.id_rol, permiso_id=permiso.id_permiso))  


    db.commit()
    db.close()
    print("Roles, permisos y relaciones cargados correctamente.")

if __name__ == "__main__":
    seed()
