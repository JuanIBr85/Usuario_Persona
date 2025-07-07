FROM python:3.13.3

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gevent

COPY . .

# Comando para desarrollo con hot reload usando gunicorn
#CMD ["gunicorn", "--bind", "0.0.0.0:5002", "--workers", "4", "--worker-class", "sync", "--timeout", "120", "run:app"]

#gevent -> convierte las operaciones IO bloqueantes a no bloqueantes, de forma simplificada un async para flask

CMD ["gunicorn", "-w", "1", "-k", "gevent", "--bind", "0.0.0.0:5002", "run:app"]

