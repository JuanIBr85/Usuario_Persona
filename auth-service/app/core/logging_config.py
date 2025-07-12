import logging
from logging.handlers import RotatingFileHandler

def configurar_logger_global(nombre_archivo="logs/errores.log"):
    handler = RotatingFileHandler(nombre_archivo, maxBytes=5*1024*1024, backupCount=3)
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    handler.setFormatter(formatter)

    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    logger.addHandler(handler)