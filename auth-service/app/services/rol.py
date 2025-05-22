from app.database.session import SessionLocal
from app.models.rol import Rol

def get_rol_por_nombre(nombre_rol):
    db = SessionLocal()
    rol = db.query(Rol).filter_by(nombre_rol=nombre_rol).first()
    db.close()
    return rol