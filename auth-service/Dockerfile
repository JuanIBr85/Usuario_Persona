# auth-service/Dockerfile
FROM python:3.13.3

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Exponer puerto para mapearlo en docker-compose
EXPOSE 5000

CMD ["python", "run.py"]