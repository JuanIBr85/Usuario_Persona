from app.database.session import Base, engine
import app.models  # Asegúrate de que todos los modelos estén importados

"""
Script: scripts.db_admin

Este módulo contiene utilidades administrativas para manejo de la base de datos
en entorno local o de desarrollo.

Funciones incluidas:
- eliminar_base(): Elimina todas las tablas de la base de datos.
- crear_base(): Crea todas las tablas definidas en los modelos SQLAlchemy.
"""

def eliminar_base():
    print("[...] Eliminando todas las tablas...")
    Base.metadata.drop_all(bind=engine)
    print("[✓] Todas las tablas eliminadas correctamente.")

def crear_base():
    print("[...] Creando todas las tablas...")
    Base.metadata.create_all(bind=engine)
    print("[✓] Base de datos creada correctamente.")
