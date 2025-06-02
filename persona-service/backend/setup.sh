#!/bin/bash

# Nombre del entorno virtual
VENV_DIR=".venv"

# Crear el entorno virtual
echo "Creando entorno virtual en el directorio $VENV_DIR..."
python3 -m venv $VENV_DIR

# Activar el entorno virtual
echo "Activando el entorno virtual..."
source $VENV_DIR/bin/activate

# Usar el pip dentro del venv para actualizar e instalar
echo "Actualizando pip dentro del entorno virtual..."
$VENV_DIR/bin/pip install --upgrade pip

echo "Instalando dependencias dentro del entorno virtual..."
$VENV_DIR/bin/pip install -r requirements.txt

echo "¡Instalación completada en el entorno virtual $VENV_DIR!"

$VENV_DIR/bin/python run.py
