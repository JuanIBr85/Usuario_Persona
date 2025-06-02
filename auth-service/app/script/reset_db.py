import os
from app.database.session import Base, engine, DB_PATH
import app.models  # Asegúrate de que esto importe todos los modelos correctamente

def eliminar_base():
    engine.dispose()  # Libera las conexiones antes de eliminar
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
        print(f"[✓] Base de datos eliminada: {DB_PATH}")
    else:
        print(f"[i] No se encontró la base de datos para eliminar en {DB_PATH}.")

def crear_base():
    print("[...] Creando base de datos...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("[✓] Base de datos creada correctamente.")
