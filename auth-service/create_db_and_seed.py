from dotenv import load_dotenv
from app.database.session import SessionLocal, engine, Base
from app.models.usuarios import Usuario
from backup_inicial import backup_base_inicial
from app.script.seed_data import seed
from sqlalchemy import inspect

load_dotenv()

def crear_base_y_seed():
    print("Conectando a la base de datos")
    inspector = inspect(engine)
    tablas = inspector.get_table_names()

    if not tablas:
        print("Creando tablas")
        Base.metadata.create_all(bind=engine)

        db = SessionLocal()
        if not db.query(Usuario).filter_by(email_usuario="superadmin@admin.com").first():
            print("Ejecutando el seed")
            seed()
        print("Creando backup inicial")
        backup_base_inicial()
    else:
        print("Las tablas ya existen. No se crea db")

if __name__ == "__main__":
    crear_base_y_seed()
