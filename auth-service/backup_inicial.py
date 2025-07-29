import os
import subprocess
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger()

def backup_base_inicial():
    if os.getenv("BACKUP_INICIAL") != "1":
        logger.info("[SKIP] BACKUP_INICIAL desactivado.")
        return

    backup_dir = Path("/app/backups")
    backup_dir.mkdir(parents=True, exist_ok=True)
    backup_file = backup_dir / "auth_db_backup_inicial.sql"

    if backup_file.exists():
        logger.info("[✓] Ya existe un backup inicial. No se genera otro.")
        return

    env = os.environ.copy()
    env["PGPASSWORD"] = os.getenv("POSTGRES_PASSWORD")

    if not env["PGPASSWORD"]:
        logger.error("[X] POSTGRES_PASSWORD no seteada")
        return

    logger.info("[→] Generando backup inicial de la base de datos...")
    try:
        subprocess.run([
            "pg_dump",
            "-h", os.getenv("POSTGRES_HOST"),
            "-U", os.getenv("POSTGRES_USER"),
            "-d", os.getenv("POSTGRES_DB"),
            "-f", str(backup_file)
        ], check=True, timeout=30, env=env)
        logger.info(f"[✓] Backup creado: {backup_file}")
    except Exception as e:
        logger.error(f"[X] Error generando backup inicial: {e}")

if __name__ == "__main__":
    backup_base_inicial()
