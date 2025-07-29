import logging
from common.utils.logging_config import logging_config
from app import create_app

# Configurar logging
logging_config("error.log", logging.ERROR)

# Crear la aplicación
app = create_app()

if __name__ == "__main__":
    # Iniciar la aplicación Flask
    print("Iniciando la aplicación Flask...")
    app.run(debug=True, host="0.0.0.0", port=5005)