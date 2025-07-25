FROM nginx:1.21.6

ENV NGINX_VERSION 1.21.6

COPY renew.sh /

RUN apt update \
 && apt install -y python3 python3-venv libaugeas0 \
 && python3 -m venv /opt/certbot \
 && /opt/certbot/bin/pip install --upgrade pip \
 && /opt/certbot/bin/pip install certbot certbot-nginx \
 && ln -s /opt/certbot/bin/certbot /usr/bin/certbot \
 && chmod +x /renew.sh
