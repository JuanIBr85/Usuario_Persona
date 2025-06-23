#!/bin/bash

# Nombre del entorno virtual
VENV_DIR=".venv"

# Eliminar entorno virtual si existe
if [ -d "$VENV_DIR" ]; then
    echo "Eliminando entorno virtual existente..."
    #rm -rf "$VENV_DIR"
fi

# Crear el entorno virtual
echo "Creando entorno virtual en el directorio $VENV_DIR..."
python3 -m venv "$VENV_DIR"

# Verificar que se creó correctamente
if [ ! -f "$VENV_DIR/bin/python" ]; then
    echo "Error: No se pudo crear el entorno virtual"
    exit 1
fi

# Usar el pip dentro del venv para actualizar
echo "Actualizando pip dentro del entorno virtual..."
"$VENV_DIR/bin/pip" install --upgrade pip

# Limpiar cache de pip
echo "Limpiando cache de pip..."
#"$VENV_DIR/bin/pip" cache purge

# Verificar que existe requirements.txt
if [ ! -f "requirements.txt" ]; then
    echo "Advertencia: No se encontró requirements.txt"
else
    echo "Instalando dependencias dentro del entorno virtual..."
    "$VENV_DIR/bin/pip" install --no-cache-dir -r requirements.txt
fi

echo "¡Instalación completada en el entorno virtual $VENV_DIR!"

# Verificar que existe run.py
if [ ! -f "app.py" ]; then
    echo "Error: No se encontró app.py"
    exit 1
fi

echo "Ejecutando app.py..."
"$VENV_DIR/bin/python" app.py
