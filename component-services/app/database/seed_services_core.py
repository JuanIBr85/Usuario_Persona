import os
from sqlalchemy import text
import time
import json
from pathlib import Path
from sqlalchemy import event
from sqlalchemy.orm import sessionmaker
from sqlalchemy import inspect
from app.models.service_model import ServiceModel
from config import SERVICES_CONFIG_FILE
from app.utils.get_component_info import get_component_info
import logging

def load_services_from_config():
    # Obtener la ruta del archivo de configuración
    config_path = os.path.join(os.getcwd(), "app/config/", SERVICES_CONFIG_FILE)
    # Cargar el archivo de configuración
    with open(config_path, "r") as f:
        config = json.load(f)

    logging.info(f"Cargando servicios desde {config_path}")
    logging.info(f"Cargando servicios desde el archivo {SERVICES_CONFIG_FILE}")

    return config.get("services", [])


# Después de crear la tabla de servicios
@event.listens_for(ServiceModel.__table__, "after_create")
def insert_initial_services(target, connection, **kw):
    Session = sessionmaker(bind=connection)
    session = Session()
    logging.info("Iniciando la carga de servicios base")
    try:
        existing_services = session.query(ServiceModel).count()
        if existing_services > 0:
            logging.info("Ya existe servicios en la base de datos")
            return  # No hacer nada si ya hay servicios

        # Cargar servicios desde el archivo de configuración
        services = load_services_from_config()
        
        # Insertar cada servicio en la base de datos
        for service_data in services:
            logging.info(f"Conectando con {service_data['service_name']}...")
            info = get_component_info(service_data["service_url"], wait=True)
            
            if info is None:
                logging.error(f"Error al conectarse con {service_data['service_name']}")
                continue

            service = ServiceModel(
                **info["service"], service_url=service_data["service_url"]
            )
            session.add(service)

        session.commit()
        logging.info("Servicios base cargados exitosamente")

    except Exception as e:
        logging.error(f"Error al cargar los servicios base: {str(e)}")
        session.rollback()
    finally:
        session.close()
