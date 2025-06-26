FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
COPY component_services.tar.gz .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Comando para desarrollo con hot reload usando gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5001", "--reload", "run:app"]
