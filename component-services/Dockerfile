FROM python:3.13.3

WORKDIR /app

# Instalar gunicorn antes de copiar el código para aprovechar la caché de Docker
RUN pip install --no-cache-dir gunicorn

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Comando para desarrollo con hot reload usando gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5002", "--reload", "run:app"]
