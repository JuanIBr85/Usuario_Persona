# auth-service/Dockerfile
#FROM python:3.13.3
FROM python:3.10-slim

WORKDIR /app
#descarga git ya que python 3.10-slim no lo tiene en su contenedor
#apt-get update && apt-get install -y git: actualiza la lista de paquetes e instala git.
#rm -rf /var/lib/apt/lists/*: limpia cache de apt para mantener la imagen más pequeña.
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

COPY component_services.tar.gz .
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Exponer puerto para mapearlo en docker-compose
EXPOSE 5000

# Comando para desarrollo con hot reload usando gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--reload", "run:app"]
