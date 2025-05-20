# Proyecto de Gestión de Usuarios y Personas

Este proyecto se divide en **tres servicios independientes**, cada uno manejado por un equipo distinto. El objetivo es desarrollar un sistema modular, escalable y seguro para la gestión de autenticación y datos personales.

---

## 🧩 Servicios

### 1. `auth-service` (Equipo 1)
Servicio de autenticación que maneja:
- Registro de usuarios.
- Inicio de sesión.
- Tokens JWT.
- Seguridad general (hash de contraseñas, 2FA, refresh tokens, etc.).

Expone su API en el puerto `5000`.

---

### 2. `persona-service` - Backend (Equipo 2)
Servicio que administra:
- Datos personales (DNI, nombre, domicilio, etc.).
- Relación entre personas y servicios públicos (becas, residencias, etc.).
- No maneja seguridad directamente (delegado a `auth-service`).

Expone su API en el puerto `5001`.

---

### 3. `persona-service` - Frontend (Equipo 3)
Interfaz en React.js para visualizar y operar sobre los datos del backend.

Corre en el puerto `5173`.

---

## 🧰 Requisitos Generales

- **Python**: 3.13.3 (todos los entornos virtuales usan esta versión).
- **Node.js y npm**: para el frontend.
- **Docker Desktop**: para contenedores y ejecución en cualquier sistema operativo.
- **Git**: para clonar el proyecto.

> 🔐 Cada servicio tiene su entorno virtual local (`venv`) solo para desarrollo, ignorado por GitHub. El entorno en Docker es independiente y se configura mediante los `Dockerfile`.

---

## 🚀 Pasos para Ejecutar el Proyecto

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/tu-repo.git
cd tu-repo
```

## 2.a 🔐 Equipo 1 – Auth Service (Backend)

### 1. Ir a la carpeta del servicio

```bash
cd auth-service
```

### 2. Crear entorno virtual local (solo para desarrollo)

```bash
python -m venv venv
.\venv\Scripts\activate     # En PowerShell
```
python3 -m venv venv
source venv/bin/activate   # En lugar de .\venv\Scripts\activate de PowerShell

### 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 4. Archivo .env
nano .env
- Crear un archivo .env con el siguiente contenido:

FLASK_ENV=development
FLASK_APP=run.py
SECRET_KEY=tu_clave_secreta
JWT_SECRET_KEY=tu_clave_jwt

### 5. Ejecutar en entorno local (sin Docker)

```bash
python run.py
```

### 6. ir a la carpeta raiz y construir y levantar con Docker todos los servicios

```bash
cd ..                                           # Ir a la carpeta donde esta el archivo docker-compose.yml con la consola.
docker compose up --build
```

### 7. O construir y levantar con docker solo el servicio auth-backend

```bash
docker compose build auth-service
docker compose up auth-service
```



## 2.b 🧍 Equipo 2 – Persona Service (Backend)

### 1. Ir a la carpeta del backend

```bash
cd persona-service/backend
```

### 2. Crear entorno virtual local (solo para desarrollo)

```bash
python -m venv venv
.\venv\Scripts\activate     # En PowerShell
```

### 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 4. Archivo .env
- Crear un archivo .env con el siguiente contenido:

FLASK_ENV=development
FLASK_APP=run.py

### 5. Ejecutar en entorno local (sin Docker)

```bash
python run.py
```

### 6. ir a la carpeta raiz y construir y levantar con Docker todos los servicios

```bash
cd ..                                           # Ir a la carpeta donde esta el archivo docker-compose.yml con la consola.
docker compose up --build
```

### 7. O construir y levantar con docker solo el servicio persona-backend

```bash
docker compose build persona-backend
docker compose up persona-backend
```

---


## 2.c 💻 Equipo 3 – Persona Service (Frontend)

### 1. Ir a la carpeta raiz

```bash
cd ..                                           # Ir a la carpeta donde esta el archivo docker-compose.yml con la consola.
```

## 2. Construir y levantar con Docker todo el programa

```bash
docker compose build persona-frontend
docker compose up persona-frontend
```

## 3. Construir y levantar con Docker solo el frontend

```bash
docker compose up --build
```