# auth-service/Dockerfile

FROM python:3.10-slim

# Instala pg_dump y git (git lo necesitás por el tar.gz)
RUN apt-get update && \
    apt-get install -y postgresql-client git && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia archivos necesarios para instalación
COPY component_services.tar.gz .
COPY requirements.txt .

# Instala dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Copia el código completo de la app
COPY . .

# Copia el entrypoint que ejecuta backup + seed antes de arrancar
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Exponer el puerto de la app
EXPOSE 5000

# Usa el script como entrypoint (ejecuta init antes de gunicorn)
ENTRYPOINT ["/entrypoint.sh"]
