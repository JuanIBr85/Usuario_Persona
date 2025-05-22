import os
import sqlite3
from app.database.session import Base, engine
import app.models  # Asegúrate de que esto importe todos los modelos correctamente

DB_PATH = "auth.db"

def eliminar_base():
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
        print(f"[✓] Base de datos eliminada: {DB_PATH}")
    else:
        print("[i] No se encontró la base de datos para eliminar.")

def crear_base():
    print("[...] Creando base de datos...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("[✓] Base de datos creada correctamente.")

def mostrar_esquemas():
    print("\n[🧩] Esquema de tablas creadas:")
    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            tablas = [fila[0] for fila in cursor.fetchall()]
            for tabla in tablas:
                print(f"\n📄 Tabla: {tabla}")
                cursor.execute(f"PRAGMA table_info({tabla});")
                columnas = cursor.fetchall()
                for col in columnas:
                    print(f"   - {col[1]} ({col[2]}) {'PRIMARY KEY' if col[5] else ''}")
    except Exception as e:
        print(f"[!] Error al mostrar esquemas: {e}")

if __name__ == "__main__":
    eliminar_base()
    crear_base()
    mostrar_esquemas()