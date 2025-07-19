import os
import logging
from logging.handlers import TimedRotatingFileHandler

def logging_config(filename:str, level:list|tuple|int, when:str = 'midnight', interval:int = 1, backup_count:int = 3,formatter:str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"):
    """
    Configura el logging para el microservicio
    """
    
    path = os.path.join(os.getcwd(), "logs", filename)

    # Validar y normalizar el parámetro level
    if not isinstance(level, (list, tuple)):
        level = [level]  # Convertir a lista si es un solo nivel

    # Crear directorio de logs si no existe
    log_dir = os.path.dirname(path)
    if log_dir and not os.path.exists(log_dir):
        os.makedirs(log_dir, exist_ok=True)

    # Crear handler
    handler = TimedRotatingFileHandler(
        path, 
        when=when,        
        interval=interval,            
        backupCount=backup_count
    )
    handler.setFormatter(logging.Formatter(formatter))
    handler.addFilter(lambda record: record.levelno in level)
    logger = logging.getLogger()
    logger.addHandler(handler)