#!/usr/bin/env python3
"""
Script de build y distribución multiplataforma
Funciona en Windows y Linux
"""

import os
import sys
import shutil
import subprocess
import re
import glob
from pathlib import Path

def clear_screen():
    """Limpia la pantalla según el sistema operativo"""
    os.system('cls' if os.name == 'nt' else 'clear')

def run_command(command, cwd=None, shell=True):
    """Ejecuta un comando del sistema y devuelve el resultado"""
    try:
        result = subprocess.run(
            command, 
            shell=shell, 
            cwd=cwd, 
            capture_output=True, 
            text=True,
            check=True
        )
        return result.returncode == 0, result.stdout, result.stderr
    except subprocess.CalledProcessError as e:
        return False, e.stdout, e.stderr

def get_python_executable():
    """Obtiene el ejecutable de Python apropiado para el sistema"""
    if os.name == 'nt':  # Windows
        return 'python'
    else:  # Linux/Unix
        return 'python3'

def get_venv_python(venv_dir):
    """Obtiene la ruta del ejecutable Python en el entorno virtual"""
    if os.name == 'nt':  # Windows
        return os.path.join(venv_dir, 'Scripts', 'python.exe')
    else:  # Linux/Unix
        return os.path.join(venv_dir, 'bin', 'python')

def get_venv_pip(venv_dir):
    """Obtiene la ruta del ejecutable pip en el entorno virtual"""
    if os.name == 'nt':  # Windows
        return os.path.join(venv_dir, 'Scripts', 'pip.exe')
    else:  # Linux/Unix
        return os.path.join(venv_dir, 'bin', 'pip')

def update_version():
    """Incrementa la versión en setup.py"""
    print("🔍 Actualizando número de versión...")
    
    if not os.path.exists('setup.py'):
        print("❌ Error: No se encontró setup.py")
        return False, None, None
    
    try:
        with open('setup.py', 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Buscar la versión actual
        version_pattern = r'version=["\']([0-9]+\.[0-9]+\.[0-9]+)["\']'
        match = re.search(version_pattern, content)
        
        if not match:
            print("❌ Error: No se pudo encontrar la versión en setup.py")
            return False, None, None
        
        current_version = match.group(1)
        version_parts = current_version.split('.')
        
        # Incrementar versión minor (último número)
        new_minor = int(version_parts[2]) + 1
        new_version = f"{version_parts[0]}.{version_parts[1]}.{new_minor}"
        
        # Reemplazar en el contenido
        new_content = re.sub(
            version_pattern, 
            f'version="{new_version}"', 
            content
        )
        
        # Escribir el archivo actualizado
        with open('setup.py', 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"✅ Versión actualizada de {current_version} a {new_version}")
        return True, current_version, new_version
        
    except Exception as e:
        print(f"❌ Error al actualizar versión: {e}")
        return False, None, None

def create_virtual_environment(venv_dir):
    """Crea el entorno virtual"""
    print(f"Creando entorno virtual en el directorio {venv_dir}...")
    
    python_exe = get_python_executable()
    success, stdout, stderr = run_command([python_exe, '-m', 'venv', venv_dir])
    
    if not success:
        print(f"❌ Error al crear entorno virtual: {stderr}")
        return False
    
    print("✅ Entorno virtual creado exitosamente")
    return True

def install_dependencies(venv_dir):
    """Instala las dependencias en el entorno virtual"""
    print("Activando el entorno virtual...")
    
    venv_pip = get_venv_pip(venv_dir)
    
    # Actualizar pip
    print("Actualizando pip dentro del entorno virtual...")
    success, stdout, stderr = run_command([venv_pip, 'install', '--upgrade', 'pip'])
    if not success:
        print(f"⚠️ Advertencia al actualizar pip: {stderr}")
    
    # Instalar requirements.txt si existe
    if os.path.exists('requirements.txt'):
        print("Instalando dependencias desde requirements.txt...")
        success, stdout, stderr = run_command([venv_pip, 'install', '-r', 'requirements.txt'])
        if not success:
            print(f"❌ Error al instalar requirements.txt: {stderr}")
            return False
    
    # Instalar herramientas de build
    print("Instalando herramientas de build...")
    build_packages = ['build', 'setuptools', 'wheel']
    for package in build_packages:
        success, stdout, stderr = run_command([venv_pip, 'install', package])
        if not success:
            print(f"⚠️ Advertencia al instalar {package}: {stderr}")
    
    print(f"¡Instalación completada en el entorno virtual {venv_dir}!")
    return True

def clean_build_files():
    """Limpia archivos de build anteriores"""
    print("🧹 Limpiando archivos temporales anteriores...")
    
    dirs_to_clean = ['build', 'dist', 'component_services.egg-info']
    
    for dir_name in dirs_to_clean:
        if os.path.exists(dir_name):
            shutil.rmtree(dir_name)
            print(f"   🗑️ Eliminado: {dir_name}/")
    
    # Limpiar cualquier archivo .egg-info
    egg_info_dirs = glob.glob('*.egg-info')
    for egg_dir in egg_info_dirs:
        if os.path.exists(egg_dir):
            shutil.rmtree(egg_dir)
            print(f"   🗑️ Eliminado: {egg_dir}/")

def build_package(venv_dir):
    """Construye el paquete"""
    print("🔨 Construyendo el paquete...")
    
    venv_python = get_venv_python(venv_dir)
    success, stdout, stderr = run_command([venv_python, '-m', 'build'])
    
    if not success:
        print(f"❌ Error al construir el paquete: {stderr}")
        return False, None
    
    # Verificar que se creó el archivo source
    if not os.path.exists('dist'):
        print("❌ Error: No se creó la carpeta dist")
        return False, None
    
    # Buscar archivos .tar.gz
    source_files = glob.glob('dist/*.tar.gz')
    if not source_files:
        print("❌ Error: No se pudo crear el archivo source")
        return False, None
    
    source_file = source_files[0]
    source_name = os.path.basename(source_file)
    
    print(f"✅ Archivo source generado: {source_name}")
    print(f"📍 Ubicación: {os.path.abspath(source_file)}")
    
    # Mostrar información del archivo
    print("\n📋 Información del archivo:")
    file_size = os.path.getsize(source_file)
    print(f"   Tamaño: {file_size:,} bytes ({file_size/1024:.1f} KB)")
    
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
    
    # Buscar carpetas con requirements.txt
    folders_found = 0
    parent_dir = current_dir.parent
    
    # Cambiar al directorio padre temporalmente para usar glob
    original_cwd = os.getcwd()
    try:
        os.chdir(parent_dir)
        
        # Buscar archivos requirements.txt con diferentes profundidades
        requirements_files = []
        search_patterns = [
            'requirements.txt',           # profundidad 0
            '*/requirements.txt',         # profundidad 1
            '*/*/requirements.txt',       # profundidad 2
            '*/*/*/requirements.txt'      # profundidad 3
        ]
        
        for pattern in search_patterns:
            found_files = glob.glob(pattern)
            for file_path in found_files:
                abs_path = parent_dir / file_path
                requirements_files.append(abs_path)
        
    finally:
        # Volver al directorio original
        os.chdir(original_cwd)
    
    # Eliminar duplicados y filtrar
    unique_dirs = set()
    for req_file in requirements_files:
        target_dir = Path(req_file).parent
        # Evitar copiar a la carpeta actual
        if target_dir != current_dir and target_dir.exists():
            unique_dirs.add(target_dir)
    
    # Copiar archivo a cada directorio encontrado
    for target_dir in unique_dirs:
        print(f"📁 Carpeta encontrada: {target_dir}")
        
        target_file = target_dir / 'component_services.tar.gz'
        
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
    print("=" * 49)
    
    # Configuración
    venv_dir = ".venv"
    
    try:
        # 1. Actualizar versión
        success, old_version, new_version = update_version()
        if not success:
            return 1
        
        # 2. Crear entorno virtual
        if os.path.exists(venv_dir):
            shutil.rmtree(venv_dir)
        
        if not create_virtual_environment(venv_dir):
            return 1
        
        # 3. Instalar dependencias
        if not install_dependencies(venv_dir):
            return 1
        
        # 4. Limpiar archivos anteriores
        clean_build_files()
        
        # 5. Construir paquete
        success, source_file = build_package(venv_dir)
        if not success:
            return 1
        
        # 6. Distribuir paquete
        if not distribute_package(source_file):
            return 1
        
        # 7. Limpiar archivos temporales
        print("\n🗑️  Limpiando carpetas temporales...")
        clean_build_files()
        
        # 8. Eliminar carpeta dist
        if os.path.exists('dist'):
            shutil.rmtree('dist')
            print("✅ Carpeta dist eliminada exitosamente")
        
        print("\n🎉 ¡Proceso completado!")
        print(f"📦 El archivo component_services.tar.gz ha sido distribuido a todas las carpetas con requirements.txt")
        
        return 0
        
    except KeyboardInterrupt:
        print("\n⚠️ Proceso interrumpido por el usuario")
        return 1
    except Exception as e:
        print(f"\n❌ Error inesperado: {e}")
        return 1
    finally:
        # Limpiar entorno virtual si existe
        if os.path.exists(venv_dir):
            try:
                shutil.rmtree(venv_dir)
                print(f"🗑️ Entorno virtual {venv_dir} eliminado")
            except:
                pass

if __name__ == "__main__":
    sys.exit(main())
