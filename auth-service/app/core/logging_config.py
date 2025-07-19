import logging
from common.utils.logging_config import logging_config


def configurar_logger_global():
    logging_config("app.log", logging.INFO)
    logging_config("error.log", logging.ERROR)
    logging_config("warning.log", logging.WARNING)

    logging.getLogger().setLevel(logging.WARNING)