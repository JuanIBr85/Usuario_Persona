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
## 5. 🧠 Modelos de Datos y schemas

Se resume la definición de los modelos de base de datos y los schemas de validación usados por el microservicio.

## 📚 Modelos

- **Persona**: datos principales de la persona.
  - `id_persona` (PK)
  - `nombre_persona`
  - `apellido_persona`
  - `fecha_nacimiento_persona`
  - `tipo_documento`
  - `num_doc_persona`
  - `usuario_id`
  - `domicilio_id` (FK)
  - `contacto_id` (FK)
  - `extendida_id` (FK)
  - `created_at`, `updated_at`, `deleted_at`

- **PersonaExtendida**: información adicional.
  - `id_extendida` (PK)
  - `estado_civil`
  - `ocupacion`
  - `estudios_alcanzados`
  - `vencimiento_dni`
  - `foto_perfil`
  - `created_at`, `updated_at`, `deleted_at`

- **Contacto**: formas de contacto de la persona.
  - `id_contacto` (PK)
  - `telefono_fijo`
  - `telefono_movil`
  - `red_social_contacto`
  - `red_social_nombre`
  - `email_contacto`
  - `observacion_contacto`
  - `created_at`, `updated_at`, `deleted_at`

- **Domicilio**: dirección física.
  - `id_domicilio` (PK)
  - `domicilio_calle`
  - `domicilio_numero`
  - `domicilio_piso`
  - `domicilio_dpto`
  - `domicilio_referencia`
  - `codigo_postal_id` (FK)
  - `created_at`, `updated_at`, `deleted_at`

- **DomicilioPostal**: valores normalizados de localidades.
  - `id_domicilio_postal` (PK)
  - `codigo_postal`
  - `localidad`
  - `partido`
  - `provincia`

## 📝 Schemas

- **PersonaSchema**: valida el cuerpo completo de una persona, incluyendo domicilio, contacto y datos extendidos.
- **PersonaResumidaSchema**: versión condensada para listados.
- **PersonaExtendidaSchema**: reglas de estado civil, ocupación y estudios alcanzados.
- **ContactoSchema**: valida teléfonos, redes y correo electrónico.
- **DomicilioSchema**: estructura de un domicilio y la relación con `DomicilioPostal`.
- **DomicilioPostalSchema**: atributos de código postal, localidad y provincia.
- **ValidarDocumentoSchema**, **ValidarDocumentoEmailSchema** y **ValidarOtpSchema**: se utilizan en los flujos de verificación y vinculación de persona con usuario.

Las implementaciones se encuentran en [`app/models`](app/models) y [`app/schema`](app/schema).

## 6. 📬 Endpoints disponibles

El microservicio `persona-service` expone una serie de endpoints organizados principalmente en dos grupos:

- **Opciones generales**: para obtener listas de valores permitidos como tipos de documento, ocupaciones, etc.
- **Gestión de persona**: incluye verificación, creación y vinculación de datos personales.

### 🧩 Rutas de opciones

Estos endpoints devuelven catálogos de valores utilizados para completar formularios y validar datos:

| Ruta                               | Método | Función asociada                       | Descripción breve                                |
|----------------------------------- |--------|----------------------------------------|--------------------------------------------------|
| `/tipos_documento`                 | GET    | `obtener_tipos_documento`              | Lista de tipos válidos de documento              |
| `/redes_sociales`                  | GET    | `obtener_red_social`                   | Lista de redes sociales válidas                  |
| `/estados_civiles`                 | GET    | `obtener_estado_civile`                | Estados civiles posibles                         |
| `/ocupaciones`                     | GET    | `obtener_ocupacion`                    | Ocupaciones disponibles                          |
| `/estudios_alcanzados`             | GET    | `obtener_estudios_alcanzados`          | Niveles educativos posibles                      |
| `/domicilios_postales/localidades` | GET    | `buscar_localidades_por_codigo_postal` | Localidades según el código postal               |
| `/domicilios_postales/buscar`      | GET    | `buscar_domicilio_postal`              | Busca un domicilio postal por código y localidad |
| `/opciones/verificar-documento`    | POST   | `verificar_documento`                  | Comprueba si un documento ya está registrado     |

### 👤 Rutas de gestión de persona

Este conjunto de endpoints permite gestionar datos personales, consultar por ID, crear y modificar personas en el sistema.

| Ruta                             | Método | Función                          | Descripción breve                                             |
|----------------------------------|--------|----------------------------------|---------------------------------------------------------------|
| `/personas`                      | GET    | `listar_personas`                | Retorna un listado completo de personas registradas           |
| `/persona_by_id`                 | GET    | `persona_by_id`                  | Devuelve la persona vinculada al usuario autenticado          |
| `/personas/<int:id>`             | GET    | `obtener_persona`                | Recupera los datos extendidos de una persona                  |
| `/crear_persona`                 | POST   | `crear_persona`                  | Crea una nueva persona con su información básica y relaciones |
| `/modificar_persona/<int:id>`    | PUT    | `modificar_persona`              | Modifica los datos de una persona existente                   |
| `/crear_persona_restringido`     | POST   | `crear_persona_restringido`      | Crea la persona asociada al usuario autenticado               |
| `/modificar_persona_restringido` | PUT    | `modificar_persona_restringido`  | Modifica la persona vinculada al usuario                      |
| `/borrar_persona/<int:id>`       | DELETE | `borrar_persona`                 | Elimina lógicamente una persona                               |
| `/restaurar_persona/<int:id>`    | PATCH  | `restaurar_persona`              | Restaura una persona previamente eliminada                    |
| `/personas_by_usuario/<int:id>`  | GET    | `obtener_persona_usuario`        | Obtiene la persona asociada a un usuario específico           |
| `/personas/count`                | GET    | `contar_personas`                | Devuelve la cantidad total de personas                        |
| `/personas/verify`               | POST   | `verificar_persona`              | Inicia verificación de persona mediante OTP                   |
| `/personas/verify-otp`           | POST   | `verificar_otp_persona`          | Confirma el OTP y vincula la persona con el usuario           |
| `/personas/verificar-identidad`  | POST   | `verificar_identidad`            | Verifica datos personales cuando no coincide el email         |

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
