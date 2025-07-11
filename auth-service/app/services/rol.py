from app.models.rol import Rol

def get_rol_por_nombre(db, nombre_rol):
    """
    Busca un rol por su nombre en la base de datos.

    Args:
        db (Session): Sesión activa de la base de datos.
        nombre_rol (str): Nombre del rol a buscar.

    Returns:
        Rol | None: Instancia del modelo Rol si se encuentra, o None si no existe.
    """
    return db.query(Rol).filter_by(nombre_rol=nombre_rol).first()