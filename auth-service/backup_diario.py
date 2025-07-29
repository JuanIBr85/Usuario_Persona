import os
from dotenv import load_dotenv
import subprocess
from pathlib import Path
from datetime import datetime
import time
import logging
load_dotenv("/app/.env")
# Configuración básica del logger
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger()

def hacer_backup_diario():
    print("[DEBUG] Ejecutando backup_diario.py...")
    backup_dir = Path("/app/backups")

    try:
        backup_dir.mkdir(parents=True, exist_ok=True)
    except Exception as e:
        logger.error(f"[X] Error creando directorio de backups: {e}")
        return

    timestamp = datetime.now().strftime("%H-%M_%d-%m-%Y")
    backup_file = backup_dir / f"auth_db_backup_{timestamp}.dump"

    env = os.environ.copy()
    env["PGPASSWORD"] = os.getenv("POSTGRES_PASSWORD")

    if not all([
        env.get("PGPASSWORD"),
        os.getenv("POSTGRES_USER"),
        os.getenv("POSTGRES_DB"),
        os.getenv("POSTGRES_HOST")
    ]):
        logger.warning("[X] Variables de entorno faltantes para generar el backup.")
        return
    logger.info(f"POSTGRES_USER = {os.getenv('POSTGRES_USER')}")
    logger.info(f"POSTGRES_PASSWORD = {os.getenv('POSTGRES_PASSWORD')}")
    logger.info(f"POSTGRES_DB = {os.getenv('POSTGRES_DB')}")
    logger.info(f"POSTGRES_HOST = {os.getenv('POSTGRES_HOST')}")

    # Retry automático (3 intentos)
    for intento in range(1, 4):
        logger.warning(f"[→] Intento {intento}: Generando backup diario...")
        try:
            subprocess.run([
                "pg_dump",
                "-h", os.getenv("POSTGRES_HOST"),
                "-U", os.getenv("POSTGRES_USER"),
                "-d", os.getenv("POSTGRES_DB"),
                "-F", "c",
                "-f", str(backup_file)
            ], check=True, timeout=30, env=env)
            logger.info(f"[✓] Backup generado: {backup_file}")
            break
        except Exception as e:
            logger.error(f"[X] Error en intento {intento}: {e}")
            time.sleep(5)
    else:
        logger.error("[X] Todos los intentos fallaron. No se pudo generar el backup.")

    # Borrar backups viejos, conservar solo los 3 más recientes
    backups = sorted(backup_dir.glob("auth_db_backup_*.dump"), key=os.path.getmtime, reverse=True)
    for old_backup in backups[3:]:
        try:
            old_backup.unlink()
            logger.info(f"[🗑] Backup antiguo eliminado: {old_backup}")
        except Exception as e:
            logger.error(f"[!] Error al borrar backup antiguo: {e}")

if __name__ == "__main__":
    hacer_backup_diario()
