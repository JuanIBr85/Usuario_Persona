from app.database.session import Base, engine
import app.models  # Asegúrate de que todos los modelos estén importados

def eliminar_base():
    print("[...] Eliminando todas las tablas...")
    Base.metadata.drop_all(bind=engine)
    print("[✓] Todas las tablas eliminadas correctamente.")

def crear_base():
    print("[...] Creando todas las tablas...")
    Base.metadata.create_all(bind=engine)
    print("[✓] Base de datos creada correctamente.")
