# ./nginx/Dockerfile
FROM openresty/openresty:alpine

# Copia la configuración personalizada
COPY conf/nginx.conf /usr/local/openresty/nginx/conf/nginx.conf
COPY conf/conf.d/ /etc/nginx/conf.d/

# Expone los puertos
EXPOSE 80 443

# daemon off; evita que nginx se ejecute en segundo plano previniendo que 
# docker termine con la ejecucion del contenedor
CMD ["/usr/local/openresty/bin/openresty", "-g", "daemon off;"]