from app.database.session import Base, engine
from app.models.models_usuarios import Usuario

print(" Creando base de datos...")
Base.metadata.create_all(bind=engine)
print(" Base de datos creada.")