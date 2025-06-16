@echo off
setlocal

:: Nombre del entorno virtual
set VENV_DIR=.venv

:: Crear el entorno virtual
echo Creando entorno virtual en el directorio %VENV_DIR%...
python -m venv %VENV_DIR%

:: Verificar que se creó correctamente
if not exist "%VENV_DIR%\Scripts\python.exe" (
    echo Error: No se pudo crear el entorno virtual
    pause
    exit /b 1
)

:: Usar el pip dentro del venv para actualizar e instalar
echo Actualizando pip dentro del entorno virtual...
%VENV_DIR%\Scripts\pip.exe install --upgrade pip

:: Verificar que existe requirements.txt
if not exist "requirements.txt" (
    echo Advertencia: No se encontro requirements.txt
    goto :run_script
)

echo Instalando dependencias dentro del entorno virtual...
%VENV_DIR%\Scripts\pip.exe install -r requirements.txt

:run_script
echo ^!Instalacion completada en el entorno virtual %VENV_DIR%^!

:: Verificar que existe run.py
if not exist "run.py" (
    echo Error: No se encontro run.py
    pause
    exit /b 1
)

echo Ejecutando run.py...
%VENV_DIR%\Scripts\python.exe run.py

:: Pausa para ver los resultados
pause