#!/bin/bash

# Configuración
DOMAIN="creus.gniglio.com.ar"
EMAIL="tu@email.com"

# Crear/renovar certificado
#certbot --nginx --non-interactive --agree-tos --email $EMAIL -d $DOMAIN -d admin.$DOMAIN

# Recargar nginx
#nginx -s reload

certbot certonly --nginx
#nginx -s reload