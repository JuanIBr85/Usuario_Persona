from app import create_app
import os
from app.script.reset_db import eliminar_base, crear_base
from app.script.seed_data import seed

app = create_app()

# Fix para recrear la DB
eliminar_base()
crear_base()
seed()

if __name__ == "__main__":
    app.run(debug=os.getenv("FLASK_DEBUG", False), host="0.0.0.0", port=5000)
