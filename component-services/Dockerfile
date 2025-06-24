FROM python:3.13.3

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Comando para desarrollo con hot reload usando gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5002", "--workers", "4", "--worker-class", "sync", "--timeout", "120", "run:app"]
