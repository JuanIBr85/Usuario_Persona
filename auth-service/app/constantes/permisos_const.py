PERMISOS = [
    "crear_usuario",
    "ver_usuario",
    "modificar_usuario",
    "eliminar_usuario",
    "crear_rol",
    "asignar_rol",
    "ver_roles",
    "ver_permisos",
    "crear_permiso",
    "asignar_permiso",
]

# Permisos por rol
PERMISOS_POR_ROL = {
    "superadmin": PERMISOS,
    "usuario": [
        "ver_usuario"
    ],
}