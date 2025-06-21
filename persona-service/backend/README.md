# 📄 Documentación Técnica – `persona-service`

## 1. 📌 Introducción

El microservicio `persona-service` forma parte de un sistema distribuido basado en microservicios. Su principal responsabilidad es gestionar la información relacionada a las personas (usuarios), incluyendo datos personales, contactos, domicilios y validaciones de identidad mediante verificación OTP.

## 2. 🧱 Arquitectura y tecnologías

- **Lenguaje**: Python 3.13
- **Framework**: Flask
- **ORM**: SQLAlchemy
- **Autenticación**: JWT
- **Base de datos**: SQLite (local)
- **Correo electrónico**: Flask-Mail
- **Contenedores**: Docker
- **Entorno**: `.env`, Dockerfile y scripts de configuración para desarrollo

## 3. ⚙️ Estructura de carpetas principal

```
persona-service/
│
├── backend/
│   ├── app/
│   │   ├── constantes/              # Constantes del sistema (tipos de documentos, redes, etc.)
│   │   ├── database/                # Módulo de conexión a base de datos
│   │   ├── interfaces/              # Interfaces de estructuras de datos
│   │   ├── models/                  # Modelos SQLAlchemy (por revisar)
│   │   ├── resources/               # Rutas y controladores
│   │   ├── schemas/                 # Validaciones con Marshmallow
│   │   ├── services/                # Lógica de negocio (servicios OTP, personas, etc.)
│   │   ├── utils/                   # Funciones auxiliares (correo, tokens)
│   │   ├── __init__.py              # Inicialización de la app Flask
│   │   └── extensions.py            # Registro de extensiones Flask
│   ├── run.py                       # Entrada principal para entorno local
│   ├── Dockerfile                   # Imagen Docker para el backend
│   ├── requirements.txt             # Dependencias Python
│   └── .env / .env.example          # Variables de entorno
```

## 4. 🚀 Ejecución local

**Requisitos:**
- Python 3.13
- Virtualenv
- SQLite
- Docker (opcional)

**Pasos básicos:**
```bash
# Crear entorno
python -m venv venv
source venv/bin/activate  # o venv\Scripts\activate en Windows

# Instalar dependencias
pip install -r requirements.txt

# Cargar variables de entorno
cp .env.example .env

# Ejecutar el backend
python run.py
```

**Con Docker:**
```bash
docker build -t persona-backend .
docker run -p 5001:5001 persona-backend
```
## 5. 🧠 Modelos de Datos

A continuación se describen los modelos de datos principales definidos mediante SQLAlchemy en el microservicio `persona-service`. Estos modelos representan las entidades relacionadas con la gestión de personas, contactos y domicilios.

### 📘 Modelo: Contacto
**Archivo**: `contacto_model.py`

- `id_contacto`: Integer, clave primaria
- `telefono_fijo`: String(15)
- `telefono_movil`: String(15)
- `red_social_contacto`: String(50)
- `red_social_nombre`: String(20)

### 🏠 Modelo: Domicilio
**Archivo**: `domicilio_model.py`

- `id_domicilio`: Integer, clave primaria
- `calle`: String(60)
- `numero`: String(10)
- `piso`: String(5)
- `departamento`: String(5)
- `localidad`: String(30)
- `provincia`: String(30)
- `codigo_postal`: String(10)

### 🏤 Modelo: DomicilioPostal
**Archivo**: `domicilio_postal_model.py`

- `id_domicilio_postal`: Integer, clave primaria
- `calle`: String(60)
- `numero`: String(10)
- `piso`: String(5)
- `departamento`: String(5)
- `localidad`: String(30)
- `provincia`: String(30)
- `codigo_postal`: String(10)

### 👤 Modelo: Persona
**Archivo**: `persona_model.py`

- `id_persona`: Integer, clave primaria
- `nombre`: String(50)
- `apellido`: String(50)
- `tipo_documento`: String(10)
- `num_doc_persona`: String(15)
- `fecha_nacimiento`: Date
- `genero`: String(20)
- `estado_civil`: String(30)
- `ocupacion`: String(50)
- `estudios`: String(50)

### 📄 Modelo: PersonaExtendida
**Archivo**: `persona_extendida_model.py`

- `id_persona_extendida`: Integer, clave primaria
- `id_persona`: Integer, clave foránea (Persona)
- `contacto_id`: Integer, clave foránea (Contacto)
- `domicilio_id`: Integer, clave foránea (Domicilio)
- `domicilio_postal_id`: Integer, clave foránea (DomicilioPostal)

Este modelo actúa como un agregador de relaciones entre las entidades que conforman los datos extendidos de una persona.

## 6. 📬 Endpoints disponibles

El microservicio `persona-service` expone una serie de endpoints organizados principalmente en dos grupos:

- **Opciones generales**: para obtener listas de valores permitidos como tipos de documento, ocupaciones, etc.
- **Gestión de persona**: incluye verificación, creación y vinculación de datos personales.

### 🧩 Rutas: `/api` – Opciones generales

Estos endpoints devuelven catálogos de valores utilizados para completar formularios y validar datos:

| Ruta                      | Método | Función asociada             | Descripción breve                               |
|---------------------------|--------|------------------------------|--------------------------------------------------|
| `/tipos_documento`        | GET    | `obtener_tipos_documento`    | Lista de tipos válidos de documento              |
| `/redes_sociales`         | GET    | `obtener_red_social`         | Lista de redes sociales válidas                  |
| `/estados_civiles`        | GET    | `obtener_estado_civile`      | Estados civiles posibles                         |
| `/ocupaciones`            | GET    | `obtener_ocupacion`          | Ocupaciones disponibles                          |
| `/estudios_alcanzados`    | GET    | `obtener_estudios_alcanzados`| Niveles educativos posibles                      |

### 👤 Rutas: `/api` – Gestión de Persona

Este conjunto de endpoints permite gestionar datos personales, consultar por ID, crear y modificar personas en el sistema.

| Ruta                             | Método | Función               | Descripción breve                                |
|----------------------------------|--------|------------------------|--------------------------------------------------|
| `/personas`                      | GET    | `listar_personas`     | Retorna un listado completo de personas registradas |
| `/persona_by_id/<int:id>`        | GET    | `persona_by_id`       | Devuelve una persona buscando directamente por ID |
| `/personas/<int:id>`             | GET    | `obtener_persona`     | Recupera los datos extendidos de una persona     |
| `/crear_persona`                 | POST   | `crear_persona`       | Crea una nueva persona con su información básica y relaciones |
| `/modificar_persona/<int:id>`    | PUT    | `modificar_persona`   | Modifica los datos de una persona existente      |

> ℹ️ Estos endpoints son parte central del flujo de verificación y registro de personas dentro del sistema.

## 7. 🔐 Flujo de verificación OTP

El sistema implementa un mecanismo de verificación basado en códigos OTP (One-Time Password) enviados por correo electrónico para validar la identidad de una persona antes de crearla o vincularla con un usuario.

### 🧠 Lógica del servicio

El servicio `OtpService`, ubicado en `app/services/otp_service.py`, tiene la siguiente funcionalidad:

```python
class OtpService:
    def solicitar_otp(self, persona) -> str:
        codigo = generar_codigo_otp()
        enviar_codigo_por_email_persona(persona, codigo)
        return codigo
```

### ✉️ Flujo de funcionamiento

1. Se detecta que la persona ya existe por su tipo y número de documento.
2. Se invoca `OtpService.solicitar_otp(persona)` para:
   - Generar un código OTP (numérico aleatorio).
   - Enviar el código al correo electrónico de la persona.
3. El código OTP es devuelto y, en algunas implementaciones, puede incluirse como claim temporal en un JWT.
4. El cliente (frontend) debe mostrar una pantalla para que el usuario ingrese el código OTP recibido.
5. El backend verifica que el código ingresado coincida con el enviado y que no haya expirado.

### 📬 Envío del correo

El envío se realiza con la función auxiliar `enviar_codigo_por_email_persona`, ubicada en `app/utils/email_util.py`.

> 🔐 Este mecanismo agrega una capa de validación de identidad antes de permitir la modificación o vinculación de datos sensibles.

## 8. 🔗 Integración con otros microservicios

El microservicio `persona-service` se integra con otros componentes del sistema distribuido para garantizar seguridad, comunicación y descubrimiento dinámico.

### 🔐 Autenticación con `auth-service`

- Se utiliza **JWT (JSON Web Token)** para validar las identidades de los usuarios que acceden a los endpoints protegidos.
- En el archivo `app/__init__.py` se inicializa la extensión:

```python
from app.extensions import jwt
jwt.init_app(app)
```

- Los tokens JWT son generados por `auth-service` y verificados localmente en `persona-service` para proteger los endpoints.

### 🌐 Registro en API Gateway con `component-service`

- El servicio se registra automáticamente en el gateway mediante el módulo:

```python
from common.utils.component_service import component_service
component_service(app)
```

- Esto permite que el `API Gateway` (component-service) detecte y enrute peticiones al microservicio de persona dinámicamente.

> 🧠 Esta arquitectura permite escalar, versionar e integrar múltiples servicios de manera desacoplada y segura.

## 9. 🧠 Casos de uso típicos y flujos

A continuación se describen los flujos de uso más comunes que implican la interacción con el microservicio `persona-service`.


### 🔍 Caso 1: Verificar si la persona ya existe por documento

**Objetivo**: Evitar duplicación de registros.

**Flujo**:
1. El frontend solicita al backend verificar si una persona ya existe por `tipo_documento` y `num_doc_persona`.
2. Si la persona existe:
   - Se genera y envía un código OTP al correo electrónico registrado.
   - Se espera que el usuario ingrese el código para confirmar su identidad.
3. Si la persona no existe:
   - Se le solicita al usuario completar un formulario para registrar su información personal.


### 📝 Caso 2: Registrar nueva persona

**Objetivo**: Crear un nuevo registro de persona cuando no existe.

**Flujo**:
1. El usuario completa el formulario con nombre, apellido, tipo y número de documento, contacto, domicilio y estudios.
2. El frontend envía la solicitud `POST /crear_persona`.
3. Se guarda la información en la base de datos, junto con relaciones a contacto y domicilios.
4. El usuario queda registrado y puede continuar con su proceso (por ejemplo: acceder a otros módulos del sistema).


### ✏️ Caso 3: Modificar datos de una persona existente

**Objetivo**: Actualizar información por parte de un operador o el propio usuario.

**Flujo**:
1. Se obtiene la persona por su ID mediante `GET /persona_by_id/<id>`.
2. El frontend muestra el formulario con los datos actuales.
3. Al guardar cambios, se realiza una solicitud `PUT /modificar_persona/<id>` con los datos actualizados.

### 📋 Caso 4: Completar formulario con opciones dinámicas

**Objetivo**: Permitir al usuario seleccionar datos validados.

**Flujo**:
1. El frontend llama a los endpoints:
   - `/tipos_documento`
   - `/redes_sociales`
   - `/estados_civiles`
   - `/ocupaciones`
   - `/estudios_alcanzados`
2. Se cargan en listas desplegables para asegurar la consistencia del input del usuario.

> ✅ Estos flujos están diseñados para garantizar la integridad de los datos, evitar duplicaciones y mejorar la experiencia de usuario.
