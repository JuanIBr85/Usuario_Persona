Auth-Service - Microservicio de Autenticación

Este servicio es el componente central de autenticación de la plataforma, encargado de la gestión de usuarios, login, roles, permisos, restauración y eliminación de cuentas. Además, implementa un sistema de backup automático seguro.

📂 Estructura del proyecto

auth-service/
├── app/
│   ├── script/
│   │   ├── backup_inicial.py         # Backup inicial único al crear DB
│   │   └── backup_diario.py          # Backup periódico con rotación y retry
│   ├── routes/                         # Endpoints Flask (usuario, admin, etc)
│   ├── database/
│   ├── core/
│   └── ...
├── backups/                             # Backups y logs
│   ├── auth_db_backup_inicial.sql
│   ├── auth_db_backup_HH-MM_DD-MM-YYYY.dump
│   └── cron.log                      # Log de ejecuciones del cron
├── cronjobs/
│   └── backup_diario.cron            # Cron que ejecuta el backup diario
├── Dockerfile
├── Dockerfile.backup                   # Dockerfile exclusivo para cron
├── requirements.txt
├── .env
└── ...

🚀 Inicio de la app

app/init.py

def create_app():
    init_app()  # Ejecuta backup_inicial si no hay tablas
    ...

init_app()

Crea tablas si no existen

Aplica seeds iniciales

Genera un backup inicial solo una vez en /app/backups/auth_db_backup_inicial.sql

🤓 Backups

🔄 Backup inicial

Generado una única vez al crear la base:

/app/backups/auth_db_backup_inicial.sql

⏰ Backup automático diario (cron)

Ejecutado por contenedor auth-backup-cron

Corre cada 30 minutos (o a las 00:00 según configuración)

Guarda backups en:

/app/backups/auth_db_backup_HH-MM_DD-MM-YYYY.dump

Mantiene solo los últimos 3 backups

Registra errores y eventos en:

/app/backups/cron.log

📅 Cron config (cronjobs/backup_diario.cron)

*/30 * * * * root python3 /app/script/backup_diario.py >> /app/backups/cron.log 2>&1

Para ejecución diaria a la medianoche:

0 0 * * * root python3 /app/script/backup_diario.py >> /app/backups/cron.log 2>&1

🐳 Docker Compose

Contenedor principal: auth-service

auth-service:
  build: ./auth-service
  ports:
    - "5000:5000"
  env_file:
    - ./auth-service/.env
  volumes:
    - ./auth-service:/app
    - ./auth-service/backups:/app/backups
  depends_on:
    auth-db:
      condition: service_healthy

Contenedor de cron: auth-backup-cron

auth-backup-cron:
  build:
    context: ./auth-service
    dockerfile: Dockerfile.backup
  depends_on:
    - auth-db
  volumes:
    - ./auth-service:/app
    - ./auth-service/backups:/app/backups
  environment:
    - POSTGRES_HOST=auth-db
    - POSTGRES_USER=usuario
    - POSTGRES_DB=auth_db
  restart: unless-stopped

🔄 Restaurar la base de datos

Desde archivo .dump:

docker exec -i auth-db pg_restore -U usuario -d auth_db < ./auth-service/backups/auth_db_backup_HH-MM_DD-MM-YYYY.dump

Desde archivo .sql:

docker exec -i auth-db psql -U usuario -d auth_db < ./auth-service/backups/auth_db_backup_inicial.sql

✅ Requisitos

Python 3.11

PostgreSQL 13+

Docker + Docker Compose

cron, pg_dump (ya vienen en Dockerfile.backup)

🔒 Recomendaciones de seguridad

Montar /app/backups como volumen externo o a una carpeta fuera del contenedor

Copiar backups automáticamente a un bucket S3 o unidad externa

No ejecutar FORZAR_RESET en producción