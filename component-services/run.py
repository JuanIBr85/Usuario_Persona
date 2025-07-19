import logging
import os

from common.utils.logging_config import logging_config

logging_config("app.log", logging.INFO)
logging_config("error.log", logging.ERROR)
logging_config("warning.log", logging.WARNING)

logging.getLogger().setLevel(logging.WARNING)

from app import create_app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5002)
