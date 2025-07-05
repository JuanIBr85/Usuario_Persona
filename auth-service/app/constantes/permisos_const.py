PERMISOS = [
    "auth.admin.crear_usuario",
    "auth.admin.ver_usuario",
    "auth.admin.modificar_usuario",
    "auth.admin.eliminar_usuario",
    "auth.admin.crear_rol",
    "auth.admin.asignar_rol",
    "auth.admin.ver_roles",
    "auth.admin.ver_permisos",
    "auth.admin.crear_permiso",
    "auth.admin.asignar_permiso",
    "auth.admin.crear_usuario_con_rol",
    "auth.admin.asignar_permisos_rol",
    "auth.admin.modificar_admin",
    "auth.admin.logout",
    "auth.admin.obtener_roles",
    "auth.admin.borrar_rol",
    "auth.admin.obtener_permisos",
    "auth.admin.modificar_rol",
    "persona.admin.crear_persona",
    "persona.admin.ver_persona",
    "persona.admin.modificar_persona",
    "persona.admin.eliminar_persona",
    "persona.admin.restaurar_persona",
    "example.admin.admin_dice",
    "auth.admin.obtener_usuarios",
    "auth.admin.modificar_usuario_con_rol",
    "auth.admin.obtener_usuarios_eliminados",
    "auth.admin.restaurar_usuario"
]

# Permisos por rol
PERMISOS_POR_ROL = {
    "superadmin": PERMISOS,
    "usuario": ["auth.admin.ver_usuario", "auth.admin.logout","auth.admin.eliminar_usuario","auth.admin.modificar_usuario"],
}
