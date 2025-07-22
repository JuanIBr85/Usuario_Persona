import logging
from common.utils.logging_config import logging_config


def configurar_logger_global():
    logging_config("app.log", logging.INFO)
    logging_config("error.log", logging.ERROR)
    logging_config("warning.log", logging.WARNING)

    logging.getLogger().setLevel(logging.WARNING)


from logging.handlers import TimedRotatingFileHandler
import os

def configurar_logger_local(nombre_logger="auth-service"):
    logger = logging.getLogger(nombre_logger)
    logger.setLevel(logging.DEBUG)  # Nivel deseado

    log_path = os.path.join(os.getcwd(), "logs", "auth_debug.log")
    os.makedirs(os.path.dirname(log_path), exist_ok=True)

    handler = TimedRotatingFileHandler(log_path, when="midnight", backupCount=3, encoding="utf-8")
    formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
    handler.setFormatter(formatter)

    logger.addHandler(handler)
    logger.propagate = False  # <— Evita duplicación en root logger

    return logger