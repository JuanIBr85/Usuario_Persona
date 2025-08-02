#!/bin/bash

RUTA="/db_data"
SALIDA="/backup/out"
FECHA=$(date +%Y%m%d)

for carpeta in "$RUTA"/*/; do
    if [ -d "$carpeta" ]; then
        nombre=$(basename "$carpeta")
        mkdir -p "$SALIDA/${nombre}"
        archivo_zip="$SALIDA/${nombre}/${nombre}_${FECHA}.zip"
        
        echo "Comprimiendo: $nombre"
        
        if zip -r "$archivo_zip" "$carpeta" > /dev/null 2>&1; then
            echo "OK: $archivo_zip"
        else
            echo "ERROR: $nombre"
        fi
    fi
done