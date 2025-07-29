#!/bin/bash
echo "Ejecutando init de base de datos y backup"
python create_db_and_seed.py

echo "Iniciando Gunicorn..."
exec gunicorn --bind 0.0.0.0:5000 run:app
