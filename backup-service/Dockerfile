FROM alpine:latest

RUN apk add --no-cache bash zip cronie tzdata

# Create crontab file
COPY crontab /etc/cron.d/mycron

# Give execution rights on the cron job
RUN chmod 0644 /etc/cron.d/mycron

# Apply cron job
RUN crontab /etc/cron.d/mycron

# Create the log file to be able to run tail
RUN touch /var/log/cron.log

ENV TZ=America/Argentina/Buenos_Aires

# Script de inicialización
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY backup.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/backup.sh


ENTRYPOINT ["/entrypoint.sh"]
