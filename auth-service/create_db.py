from app.database.session import Base, engine
import app.models

print(" Creando base de datos...")
Base.metadata.drop_all(bind=engine)  #--> para reiniciar la base de datos
Base.metadata.create_all(bind=engine)
print(" Base de datos creada.")