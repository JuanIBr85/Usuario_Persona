import os
import json
from pathlib import Path
from sqlalchemy import event
from sqlalchemy.orm import sessionmaker
from app.models.service_model import ServiceModel
from config import SERVICES_CONFIG_FILE


def load_services_from_config():
    # Obtener la ruta del archivo de configuración
    config_path = os.path.join(
        os.path.dirname(__file__), "../config/", SERVICES_CONFIG_FILE
    )
    # Cargar el archivo de configuración
    with open(config_path, "r") as f:
        config = json.load(f)

    return config.get("services", [])


# Después de crear la tabla de servicios
@event.listens_for(ServiceModel.__table__, "after_create")
def insert_initial_services(target, connection, **kw):
    Session = sessionmaker(bind=connection)
    session = Session()
    print("Iniciando la carga de servicios base")
    try:
        # Verificar si ya existen servicios
        existing_services = session.query(ServiceModel).count()
        if existing_services > 0:
            return  # No hacer nada si ya hay servicios

        # Cargar servicios desde el archivo de configuración
        services = load_services_from_config()

        # Insertar cada servicio en la base de datos
        for service_data in services:
            print(service_data)
            service = ServiceModel(**service_data)
            session.add(service)

        session.commit()
        print("Servicios base cargados exitosamente")

    except Exception as e:
        print(f"Error al cargar los servicios base: {str(e)}")
        print(f"Error al cargar los servicios base: {e.with_traceback()}")
        session.rollback()
    finally:
        session.close()
