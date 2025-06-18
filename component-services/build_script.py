#!/usr/bin/env python3
"""
Script de build y distribución multiplataforma - Versión corregida
Funciona en Windows y Linux con manejo mejorado de permisos
"""

import os
import sys
import shutil
import subprocess
import re
import glob
import time
import tempfile
import stat
from pathlib import Path


def clear_screen():
    """Limpia la pantalla según el sistema operativo"""
    os.system("cls" if os.name == "nt" else "clear")


def handle_remove_readonly(func, path, exc):
    """
    Maneja archivos de solo lectura en Windows
    Se usa como handler para shutil.rmtree
    """
    if os.path.exists(path):
        os.chmod(path, stat.S_IWRITE)
        func(path)


def safe_remove_directory(path):
    """
    Elimina un directorio de forma segura en Windows y Linux
    """
    if not os.path.exists(path):
        return True

    max_attempts = 3
    for attempt in range(max_attempts):
        try:
            if os.name == "nt":  # Windows
                # En Windows, primero intentar cambiar permisos
                for root, dirs, files in os.walk(path):
                    for dir_name in dirs:
                        dir_path = os.path.join(root, dir_name)
                        try:
                            os.chmod(dir_path, stat.S_IWRITE)
                        except:
                            pass
                    for file_name in files:
                        file_path = os.path.join(root, file_name)
                        try:
                            os.chmod(file_path, stat.S_IWRITE)
                        except:
                            pass

                # Usar shutil.rmtree con handler personalizado
                shutil.rmtree(path, onerror=handle_remove_readonly)
            else:  # Linux/Unix
                shutil.rmtree(path)

            return True

        except Exception as e:
            if attempt < max_attempts - 1:
                print(
                    f"   ⚠️ Intento {attempt + 1} fallido, reintentando en 2 segundos..."
                )
                time.sleep(2)
            else:
                print(f"   ❌ No se pudo eliminar {path}: {e}")
                return False

    return False


def run_command(command, cwd=None, shell=False, timeout=300):
    """
    Ejecuta un comando del sistema y devuelve el resultado
    """
    try:
        # En Windows, usar shell=True para comandos de Python puede ayudar
        if (
            os.name == "nt"
            and isinstance(command, list)
            and "python" in command[0].lower()
        ):
            shell = True
            if isinstance(command, list):
                command = " ".join(f'"{arg}"' if " " in arg else arg for arg in command)

        process = subprocess.Popen(
            command,
            shell=shell,
            cwd=cwd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,
            universal_newlines=True,
        )

        stdout_lines = []
        stderr_lines = []

        start_time = time.time()
        while True:
            if time.time() - start_time > timeout:
                process.kill()
                return (
                    False,
                    "\n".join(stdout_lines),
                    f"Tiempo de espera agotado ({timeout} segundos)",
                )

            while True:
                output = process.stdout.readline()
                if output == "" and process.poll() is not None:
                    break
                if output:
                    output = output.strip()
                    if output:
                        print(f"   | {output}")
                        stdout_lines.append(output)

            while True:
                error = process.stderr.readline()
                if error == "" and process.poll() is not None:
                    break
                if error:
                    error = error.strip()
                    if error:
                        print(f"   ! {error}")
                        stderr_lines.append(error)

            if process.poll() is not None:
                break

            time.sleep(0.1)

        return_code = process.returncode
        return return_code == 0, "\n".join(stdout_lines), "\n".join(stderr_lines)

    except Exception as e:
        return False, "", f"Error al ejecutar comando: {str(e)}"


def get_python_executable():
    """Obtiene el ejecutable de Python apropiado para el sistema"""
    if os.name == "nt":  # Windows
        # Usar el Python actual del sistema
        return sys.executable
    else:  # Linux/Unix
        return sys.executable or "python3"


def get_venv_python(venv_dir):
    """Obtiene la ruta del ejecutable Python en el entorno virtual"""
    if os.name == "nt":  # Windows
        return os.path.join(venv_dir, "Scripts", "python.exe")
    else:  # Linux/Unix
        return os.path.join(venv_dir, "bin", "python")


def get_venv_pip(venv_dir):
    """Obtiene la ruta del ejecutable pip en el entorno virtual"""
    if os.name == "nt":  # Windows
        return os.path.join(venv_dir, "Scripts", "pip.exe")
    else:  # Linux/Unix
        return os.path.join(venv_dir, "bin", "pip")


def check_admin_privileges():
    """Verifica si el script se está ejecutando con privilegios de administrador"""
    if os.name == "nt":  # Windows
        try:
            import ctypes

            return ctypes.windll.shell32.IsUserAnAdmin()
        except:
            return False
    else:  # Linux/Unix
        return os.geteuid() == 0


def update_version():
    """Incrementa la versión en setup.py"""
    print("🔍 Actualizando número de versión...")

    if not os.path.exists("setup.py"):
        print("❌ Error: No se encontró setup.py")
        return False, None, None

    try:
        with open("setup.py", "r", encoding="utf-8") as f:
            content = f.read()

        version_pattern = r'version=["\']([0-9]+\.[0-9]+\.[0-9]+)["\']'
        match = re.search(version_pattern, content)

        if not match:
            print("❌ Error: No se pudo encontrar la versión en setup.py")
            return False, None, None

        current_version = match.group(1)
        version_parts = current_version.split(".")

        new_minor = int(version_parts[2]) + 1
        new_version = f"{version_parts[0]}.{version_parts[1]}.{new_minor}"

        new_content = re.sub(version_pattern, f'version="{new_version}"', content)

        with open("setup.py", "w", encoding="utf-8") as f:
            f.write(new_content)

        print(f"✅ Versión actualizada de {current_version} a {new_version}")
        return True, current_version, new_version

    except Exception as e:
        print(f"❌ Error al actualizar versión: {e}")
        return False, None, None


def create_virtual_environment(venv_dir):
    """Crea el entorno virtual con manejo mejorado de errores"""
    print(f"Creando entorno virtual en el directorio {venv_dir}...")

    # Verificar permisos
    current_dir = os.getcwd()
    if not os.access(current_dir, os.W_OK):
        print(f"❌ Error: No hay permisos de escritura en {current_dir}")
        if os.name == "nt":
            print("💡 Sugerencia: Ejecuta PowerShell como Administrador")
        return False

    # Limpiar directorio existente de forma segura
    if os.path.exists(venv_dir):
        print(f"🗑️ Eliminando entorno virtual existente...")
        if not safe_remove_directory(venv_dir):
            print(f"❌ No se pudo eliminar el directorio existente {venv_dir}")
            return False

    python_exe = get_python_executable()
    print(f"🐍 Usando Python: {python_exe}")

    # Crear directorio temporal si es necesario
    temp_dir = None
    try:
        # Intentar crear en el directorio actual primero
        cmd = [python_exe, "-m", "venv", venv_dir]
        success, stdout, stderr = run_command(cmd, shell=os.name == "nt", timeout=120)

        if not success:
            print(f"❌ Error al crear entorno virtual: {stderr}")

            # Intentar con virtualenv como alternativa
            print("🔄 Intentando instalar virtualenv...")
            install_cmd = [python_exe, "-m", "pip", "install", "--user", "virtualenv"]
            install_success, _, install_stderr = run_command(
                install_cmd, shell=os.name == "nt"
            )

            if install_success:
                print("🔄 Creando entorno virtual con virtualenv...")
                venv_cmd = [python_exe, "-m", "virtualenv", venv_dir]
                success, stdout, stderr = run_command(venv_cmd, shell=os.name == "nt")

            if not success:
                # Como último recurso, usar directorio temporal
                print("🔄 Intentando en directorio temporal...")
                temp_dir = tempfile.mkdtemp(prefix="venv_temp_")
                temp_venv = os.path.join(temp_dir, "venv")

                temp_cmd = [python_exe, "-m", "venv", temp_venv]
                success, stdout, stderr = run_command(temp_cmd, shell=os.name == "nt")

                if success:
                    # Mover el entorno temporal al directorio final
                    try:
                        shutil.move(temp_venv, venv_dir)
                        print(f"✅ Entorno virtual creado via directorio temporal")
                    except Exception as e:
                        print(f"❌ Error moviendo entorno temporal: {e}")
                        success = False

    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        success = False

    finally:
        # Limpiar directorio temporal
        if temp_dir and os.path.exists(temp_dir):
            safe_remove_directory(temp_dir)

    if not success:
        print(f"❌ No se pudo crear el entorno virtual.")
        if os.name == "nt":
            print("💡 Posibles soluciones:")
            print("   - Ejecutar PowerShell como Administrador")
            print("   - Verificar que no hay antivirus bloqueando la creación")
            print("   - Cerrar IDEs que puedan estar usando archivos de Python")
            print("   - Verificar que tienes permisos en el directorio actual")
        return False

    print("✅ Entorno virtual creado exitosamente")
    return True


def install_dependencies(venv_dir):
    """Instala las dependencias en el entorno virtual"""
    print("🔍 Verificando entorno virtual...")

    if not os.path.exists(venv_dir):
        print(f"❌ Error: No se encontró el entorno virtual en {venv_dir}")
        return False

    venv_pip = get_venv_pip(venv_dir)

    if not os.path.exists(venv_pip):
        print(f"❌ Error: No se encontró pip en {venv_pip}")
        return False

    print("🔄 Actualizando pip dentro del entorno virtual...")
    success, stdout, stderr = run_command(
        [venv_pip, "install", "--upgrade", "pip"], shell=os.name == "nt", timeout=300
    )

    if not success:
        print(f"⚠️ Advertencia al actualizar pip: {stderr}")

    print("📦 Instalando herramientas de build...")
    build_packages = ["setuptools>=65.5.1", "wheel>=0.38.4", "build>=0.10.0"]

    success, stdout, stderr = run_command(
        [venv_pip, "install", "--upgrade"] + build_packages,
        shell=os.name == "nt",
        timeout=600,
    )

    if not success:
        print(f"❌ Error al instalar herramientas de build: {stderr}")
        return False

    requirements_path = os.path.join(os.getcwd(), "requirements.txt")
    if os.path.exists(requirements_path):
        print("📋 Instalando dependencias desde requirements.txt...")
        success, stdout, stderr = run_command(
            [venv_pip, "install", "-r", requirements_path],
            shell=os.name == "nt",
            timeout=1200,
        )

        if not success:
            print(f"❌ Error al instalar requirements.txt: {stderr}")
            return False

    print(f"✅ ¡Instalación completada en el entorno virtual {venv_dir}!")
    return True


def clean_build_files():
    """Limpia archivos de build anteriores"""
    print("🧹 Limpiando archivos temporales anteriores...")

    dirs_to_clean = ["build", "dist", "component_services.egg-info"]

    for dir_name in dirs_to_clean:
        if os.path.exists(dir_name):
            if safe_remove_directory(dir_name):
                print(f"   🗑️ Eliminado: {dir_name}/")
            else:
                print(f"   ⚠️ No se pudo eliminar: {dir_name}/")

    egg_info_dirs = glob.glob("*.egg-info")
    for egg_dir in egg_info_dirs:
        if os.path.exists(egg_dir):
            if safe_remove_directory(egg_dir):
                print(f"   🗑️ Eliminado: {egg_dir}/")


def build_package(venv_dir):
    """Construye el paquete"""
    print("🔨 Construyendo el paquete...")

    venv_python = get_venv_python(venv_dir)

    print("   🔍 Verificando herramientas de build...")
    build_tools = ["build", "wheel", "setuptools"]
    for tool in build_tools:
        print(f"   📦 Instalando/actualizando {tool}...")
        success, _, stderr = run_command(
            [venv_python, "-m", "pip", "install", "--upgrade", tool],
            shell=os.name == "nt",
        )
        if not success:
            print(f"   ❌ Error al instalar {tool}: {stderr}")

    print("   🏗️  Ejecutando build...")
    success, stdout, stderr = run_command(
        [venv_python, "-m", "build", "--no-isolation"], shell=os.name == "nt"
    )

    if not success:
        print(f"❌ Error al construir el paquete. Detalles:")
        if stderr:
            for line in stderr.split("\n"):
                if line.strip():
                    print(f"   ❗ {line}")
        return False, None

    if not os.path.exists("dist"):
        print("❌ Error: No se creó la carpeta 'dist'")
        return False, None

    time.sleep(1)

    source_files = glob.glob("dist/*.tar.gz")
    if not source_files:
        print("❌ Error: No se pudo crear el archivo fuente (.tar.gz)")
        return False, None

    source_file = source_files[0]
    source_name = os.path.basename(source_file)

    print(f"\n✅ ¡Paquete construido exitosamente!")
    print(f"📦 Archivo generado: {source_name}")
    print(f"📂 Ubicación: {os.path.abspath(source_file)}")

    try:
        file_size = os.path.getsize(source_file)
        print(f"📊 Tamaño: {file_size:,} bytes ({file_size/1024:.1f} KB)")
    except Exception as e:
        print(f"⚠️  No se pudo obtener el tamaño del archivo: {e}")

    return True, source_file


def distribute_package(source_file):
    """Distribuye el paquete a carpetas con requirements.txt"""
    print("\n🔍 Buscando carpetas con requirements.txt (profundidad máxima: 3)...")
    print("=" * 66)

    current_dir = Path.cwd()
    source_path = Path(source_file)

    if not source_path.exists():
        print(f"❌ Error: No se encuentra el archivo {source_path}")
        return False

    folders_found = 0
    parent_dir = current_dir.parent

    original_cwd = os.getcwd()
    try:
        os.chdir(parent_dir)

        requirements_files = []
        search_patterns = [
            "requirements.txt",
            "*/requirements.txt",
            "*/*/requirements.txt",
            "*/*/*/requirements.txt",
        ]

        for pattern in search_patterns:
            found_files = glob.glob(pattern)
            for file_path in found_files:
                abs_path = parent_dir / file_path
                requirements_files.append(abs_path)

    finally:
        os.chdir(original_cwd)

    unique_dirs = set()
    for req_file in requirements_files:
        target_dir = Path(req_file).parent
        if target_dir != current_dir and target_dir.exists():
            unique_dirs.add(target_dir)

    for target_dir in unique_dirs:
        print(f"📁 Carpeta encontrada: {target_dir}")

        target_file = target_dir / "component_services.tar.gz"

        try:
            shutil.copy2(source_path, target_file)
            print(f"   ✅ {source_path.name} copiado exitosamente")
            folders_found += 1
        except Exception as e:
            print(f"   ❌ Error al copiar {source_path.name}: {e}")

    print(f"\n📊 Resumen de distribución:")
    print(f"   - Carpetas encontradas: {len(unique_dirs)}")
    print(f"   - Archivos distribuidos: {folders_found}")

    return True


def main():
    """Función principal"""
    clear_screen()
    print("🏗️  Iniciando proceso de build y distribución...")
    print("👉 SIEMPRE EJECUTE ESTO SIN UN ENTORNO VIRTUAL ACTIVO 👈")
    print("=" * 49)

    # Verificar permisos en Windows
    if os.name == "nt" and not check_admin_privileges():
        print("⚠️  Nota: No se detectaron privilegios de administrador.")
        print(
            "💡 Si encuentras problemas de permisos, ejecuta PowerShell como Administrador."
        )
        print()

    venv_dir = ".venv"

    try:
        success, old_version, new_version = update_version()
        if not success:
            return 1

        if not create_virtual_environment(venv_dir):
            return 1

        if not install_dependencies(venv_dir):
            return 1

        clean_build_files()

        success, source_file = build_package(venv_dir)
        if not success:
            return 1

        if not distribute_package(source_file):
            return 1

        print("\n🗑️  Limpiando carpetas temporales...")
        clean_build_files()

        if os.path.exists("dist"):
            if safe_remove_directory("dist"):
                print("✅ Carpeta dist eliminada exitosamente")

        print("\n🎉 ¡Proceso completado!")
        print(
            f"📦 El archivo component_services.tar.gz ha sido distribuido a todas las carpetas con requirements.txt"
        )

        return 0

    except KeyboardInterrupt:
        print("\n⚠️ Proceso interrumpido por el usuario")
        return 1
    except Exception as e:
        print(f"\n❌ Error inesperado: {e}")
        return 1
    finally:
        if os.path.exists(venv_dir):
            if safe_remove_directory(venv_dir):
                print(f"🗑️ Entorno virtual {venv_dir} eliminado")


if __name__ == "__main__":
    sys.exit(main())
