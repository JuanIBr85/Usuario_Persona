FROM python:3.13.3

WORKDIR /app

COPY requirements.txt .
COPY component_services.tar.gz .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD [ "python", "run.py" ]