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
    "crear_usuario_con_rol",
    "asignar_permisos_rol",
    "modificar_admin",
    "logout"
]

# Permisos por rol
PERMISOS_POR_ROL = {
    "superadmin": PERMISOS,
    "usuario": [
        "ver_usuario",
        "logout"
    ],
}