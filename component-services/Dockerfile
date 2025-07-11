#El que mejor funcion
FROM python:3.13.3

ENV WORKERS=1
ENV THREADS=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gevent

COPY . .

#gevent -> convierte las operaciones IO bloqueantes a no bloqueantes, de forma simplificada un async para flask
CMD gunicorn -w ${WORKERS} -k gevent --threads ${THREADS} --bind 0.0.0.0:5002 run:app

