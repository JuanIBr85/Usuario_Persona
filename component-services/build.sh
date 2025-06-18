#!/bin/bash

clear

# Nombre del entorno virtual
VENV_DIR=".venv"

echo "🏗️  Iniciando proceso de build y distribución..."
echo "================================================="

# Incrementar versión en setup.py
echo "🔍 Actualizando número de versión..."
CURRENT_VERSION=$(grep -oP "version=['\"]\K[0-9]+\.[0-9]+\.[0-9]+(?=['\"])" setup.py)
IFS='.' read -r -a VERSION_PARTS <<< "$CURRENT_VERSION"
MINOR_VERSION=$((VERSION_PARTS[2] + 1))
NEW_VERSION="${VERSION_PARTS[0]}.${VERSION_PARTS[1]}.$MINOR_VERSION"
sed -i "s/version=\"$CURRENT_VERSION\"/version=\"$NEW_VERSION\"/" setup.py
echo "✅ Versión actualizada de $CURRENT_VERSION a $NEW_VERSION"

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

$VENV_DIR/bin/pip install build source setuptools

echo "¡Instalación completada en el entorno virtual $VENV_DIR!"

# Limpiar archivos de build anteriores
echo "🧹 Limpiando archivos temporales anteriores..."
rm -rf build/
rm -rf dist/
rm -rf component_services.egg-info/
rm -rf *.egg-info/

# Construir el paquete
echo "🔨 Construyendo el paquete..."
$VENV_DIR/bin/python -m build 

# Verificar que se creó el archivo source
if [ ! -d "dist" ] || [ -z "$(ls -A dist/*.tar.gz 2>/dev/null)" ]; then
    echo "❌ Error: No se pudo crear el archivo source"
    exit 1
fi

# Obtener el nombre del archivo source sin renombrarlo
echo "📦 Identificando archivo source generado..."
SOURCE_FILE=$(ls dist/*.tar.gz | head -1)

if [ -n "$SOURCE_FILE" ]; then
    SOURCE_NAME=$(basename "$SOURCE_FILE")
    echo "✅ Archivo source generado: $SOURCE_NAME"
    echo "📍 Ubicación: $(pwd)/$SOURCE_FILE"
    
    # Mostrar información del archivo
    echo ""
    echo "📋 Información del archivo:"
    ls -lh "$SOURCE_FILE"
else
    echo "⚠️  Advertencia: No se encontró archivo source"
    exit 1
fi

# Limpiar carpetas temporales después del build
echo "🗑️  Limpiando carpetas temporales..."
rm -rf build/
rm -rf component_services.egg-info/
rm -rf *.egg-info/

echo ""
echo "🎉 ¡Build completado!"

# ==================== NUEVA FUNCIONALIDAD ====================
echo ""
echo "🔍 Buscando carpetas con requirements.txt (profundidad máxima: 3)..."
echo "=================================================================="

# Verificar que existe el archivo source antes de distribuir
CURRENT_DIR=$(pwd)
SOURCE_PATH="$CURRENT_DIR/$SOURCE_FILE"
if [ ! -f "$SOURCE_PATH" ]; then
    echo "❌ Error: No se encuentra el archivo $SOURCE_PATH"
    exit 1
fi

# Buscar carpetas con requirements.txt y copiar el source
FOLDERS_FOUND=0
find .. -maxdepth 3 -name "requirements.txt" -type f | while read -r req_file; do
    target_dir=$(dirname "$req_file")
    
    # Evitar copiar a la carpeta actual (donde ya está dist/)
    if [ "$target_dir" != "." ]; then
        echo "📁 Carpeta encontrada: $target_dir"
        
        # Copiar el archivo source a la carpeta objetivo manteniendo el nombre original
        cp "$SOURCE_PATH" "$target_dir/component_services.tar.gz"
        
        if [ $? -eq 0 ]; then
            echo "   ✅ $SOURCE_NAME copiado exitosamente"
        else
            echo "   ❌ Error al copiar $SOURCE_NAME"
        fi
        
        FOLDERS_FOUND=$((FOLDERS_FOUND + 1))
    fi
done

# Como el bucle while está en un subshell, necesitamos otra forma de contar
TOTAL_FOLDERS=$(find .. -maxdepth 3 -name "requirements.txt" -type f -exec dirname {} \; | grep -v "^\\.$" | wc -l)   

echo ""
echo "📊 Resumen de distribución:"
echo "   - Carpetas encontradas: $TOTAL_FOLDERS"
echo "   - Archivos distribuidos: $TOTAL_FOLDERS"

# Eliminar la carpeta dist
echo ""
echo "🗑️  Eliminando carpeta dist..."
rm -rf dist/

if [ ! -d "dist" ]; then
    echo "✅ Carpeta dist eliminada exitosamente"
else
    echo "⚠️  Advertencia: No se pudo eliminar la carpeta dist"
fi

echo ""
echo "🎉 ¡Proceso completado!"
echo "📦 El archivo $SOURCE_NAME ha sido distribuido a todas las carpetas con requirements.txt"
