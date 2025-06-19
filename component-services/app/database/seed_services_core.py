import os
import time
import json
from pathlib import Path
from sqlalchemy import event
from sqlalchemy.orm import sessionmaker
from app.models.service_model import ServiceModel
from config import SERVICES_CONFIG_FILE
from app.utils.get_component_info import get_component_info


def load_services_from_config():
    # Obtener la ruta del archivo de configuración
    config_path = os.path.join(os.getcwd(), "app/config/", SERVICES_CONFIG_FILE)
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
            print(f"Conectando con {service_data['service_name']}...")
            info = get_component_info(service_data["service_url"], wait=True)

            service = ServiceModel(
                **info["service"], service_url=service_data["service_url"]
            )
            session.add(service)

        session.commit()
        print("Servicios base cargados exitosamente")

    except Exception as e:
        print(f"Error al cargar los servicios base: {str(e)}")
        session.rollback()
    finally:
        session.close()
