import logging
import os
from logging.handlers import RotatingFileHandler

def configurar_logger_global(nombre_archivo="logs/errores.log"):
    # Crear directorio de logs si no existe
    log_dir = os.path.dirname(nombre_archivo)
    if log_dir and not os.path.exists(log_dir):
        os.makedirs(log_dir, exist_ok=True)
        
    handler = RotatingFileHandler(nombre_archivo, maxBytes=5*1024*1024, backupCount=3)
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    handler.setFormatter(formatter)

    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    logger.addHandler(handler)