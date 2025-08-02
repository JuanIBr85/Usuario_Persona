#!/bin/bash

# Instalar el crontab si existe
if [ -f /etc/cron.d/mycron ]; then
    crontab /etc/cron.d/mycron
    echo "Crontab instalado"
fi

# Ejecutar crond en primer plano
exec crond -f
