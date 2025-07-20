# ejecutar con: python -m app.script.seed_data

import os
from app.database.session import SessionLocal
from app.models.rol import Rol, RolUsuario
from app.models.permisos import Permiso, RolPermiso
from app.models.usuarios import Usuario
from werkzeug.security import generate_password_hash
from datetime import datetime, timezone
from app.constantes.permisos_const import PERMISOS, PERMISOS_POR_ROL

"""
Script: scripts.seed

Este módulo inicializa la base de datos con datos predeterminados esenciales
para el funcionamiento del sistema.

Funcionalidades:
- Crea todos los permisos definidos en `PERMISOS`.
- Crea los roles definidos en `PERMISOS_POR_ROL` y les asigna los permisos correspondientes.
- Crea un usuario SuperAdmin con email `superadmin@admin.com` y contraseña `Admin123!` (ya hasheada).
- Asocia al SuperAdmin el rol "superadmin".

Este script está destinado a entornos de desarrollo o testing. No debe ejecutarse en producción
sin modificaciones o medidas de seguridad adicionales.

"""

def seed():
    db = SessionLocal()

    # Crear permisos
    permisos_creados = {}
    for nombre in PERMISOS:
        permiso = db.query(Permiso).filter_by(nombre_permiso=nombre).first()
        if not permiso:
            permiso = Permiso(nombre_permiso=nombre)
            db.add(permiso)
            db.commit()
            db.refresh(permiso)
        permisos_creados[nombre] = permiso

    # Crear roles y asignar permisos
    for nombre_rol, permisos in PERMISOS_POR_ROL.items():
        rol = db.query(Rol).filter_by(nombre_rol=nombre_rol).first()
        if not rol:
            rol = Rol(nombre_rol=nombre_rol)
            db.add(rol)
            db.commit()
            db.refresh(rol)

        for nombre_permiso in permisos:
            permiso = permisos_creados[nombre_permiso]
            existe = db.query(RolPermiso).filter_by(id_rol=rol.id_rol, permiso_id=permiso.id_permiso).first()
            if not existe:
                db.add(RolPermiso(id_rol=rol.id_rol, permiso_id=permiso.id_permiso))

    db.commit()

    # Crear superadmin
    email = os.getenv("ADMIN_EMAIL", "superadmin@admin.com")
    superadmin = db.query(Usuario).filter_by(email_usuario=email).first()
    if not superadmin:
        superadmin = Usuario(
            nombre_usuario="superadmin",
            email_usuario=email,
            email_verificado=1,
            password=generate_password_hash("Admin123!"),
        )
        db.add(superadmin)
        db.commit()
        db.refresh(superadmin)

        rol_superadmin = db.query(Rol).filter_by(nombre_rol="superadmin").first()
        db.add(RolUsuario(id_rol=rol_superadmin.id_rol, id_usuario=superadmin.id_usuario))
        db.commit()

    db.close()
    print("Seed ejecutado correctamente.")

if __name__ == "__main__":
    seed()
