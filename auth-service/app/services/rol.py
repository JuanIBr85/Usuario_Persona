from app.models.rol import Rol

def get_rol_por_nombre(db, nombre_rol):
    return db.query(Rol).filter_by(nombre_rol=nombre_rol).first()