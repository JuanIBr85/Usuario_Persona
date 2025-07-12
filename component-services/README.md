# Component Services API

Documentación de los endpoints disponibles en el servicio de componentes.

## Endpoints de Control

### Gateway

#### `GET /api/control/gateway/research`
- **Descripción**: Inicia una búsqueda en segundo plano para actualizar los endpoints disponibles.
- **Límite**: 2 solicitudes por minuto
- **Respuestas**:
  - `202 Accepted`: Búsqueda iniciada correctamente o ya en progreso
  - `200 OK`: Búsqueda iniciada correctamente
- **Códigos de estado**: 200, 202

#### `GET /api/control/gateway/research_status`
- **Descripción**: Obtiene el estado actual de la búsqueda de endpoints.
- **Límite**: 5 solicitudes por minuto
- **Respuestas**:
  - `200 OK`: Devuelve el estado de la búsqueda
    ```json
    {
      "search_in_progress": boolean,
      "log": [string]
    }
    ```
- **Códigos de estado**: 200

#### `GET /api/control/gateway/research_stop`
- **Descripción**: Detiene la búsqueda de endpoints en curso.
- **Límite**: 2 solicitudes por minuto
- **Respuestas**:
  - `200 OK`: Búsqueda detenida correctamente
- **Códigos de estado**: 200

### Servicios

#### `GET /api/control/services/all`
- **Descripción**: Obtiene todos los servicios registrados con su estado de salud.
- **Límite**: 15 solicitudes por minuto
- **Respuestas**:
  - `200 OK`: Lista de servicios con su estado de salud
  - `500 Internal Server Error`: Error al obtener los servicios
- **Códigos de estado**: 200, 500

#### `GET /api/control/services/get_service/<int:id>`
- **Descripción**: Obtiene un servicio específico por su ID con su estado de salud.
- **Parámetros de ruta**:
  - `id` (entero): ID del servicio a consultar
- **Límite**: 15 solicitudes por minuto
- **Respuestas**:
  - `200 OK`: Servicio encontrado
  - `404 Not Found`: Servicio no encontrado
  - `500 Internal Server Error`: Error al obtener el servicio
- **Códigos de estado**: 200, 404, 500

#### `POST /api/control/services/install_service`
- **Descripción**: Instala un nuevo servicio.
- **Cuerpo de la solicitud**:
  ```json
  {
    "url": "string"
  }
  ```
- **Límite**: 5 solicitudes por minuto
- **Respuestas**:
  - `200 OK`: Servicio instalado correctamente
  - `400 Bad Request`: URL inválida o servicio ya existe
  - `500 Internal Server Error`: Error al instalar el servicio
- **Códigos de estado**: 200, 400, 500

#### `PUT /api/control/services/refresh_service/<int:id>`
- **Descripción**: Actualiza la información de un servicio existente.
- **Parámetros de ruta**:
  - `id` (entero): ID del servicio a actualizar
- **Límite**: 5 solicitudes por minuto
- **Respuestas**:
  - `200 OK`: Servicio actualizado correctamente
  - `400 Bad Request`: Error al conectar con el servicio
  - `404 Not Found`: Servicio no encontrado
  - `500 Internal Server Error`: Error al actualizar el servicio
- **Códigos de estado**: 200, 400, 404, 500

#### `DELETE /api/control/services/remove_service/<int:id>`
- **Descripción**: Elimina un servicio.
- **Parámetros de ruta**:
  - `id` (entero): ID del servicio a eliminar
- **Límite**: 5 solicitudes por minuto
- **Respuestas**:
  - `200 OK`: Servicio eliminado correctamente
  - `400 Bad Request`: No se puede eliminar un servicio core
  - `404 Not Found`: Servicio no encontrado
  - `500 Internal Server Error`: Error al eliminar el servicio
- **Códigos de estado**: 200, 400, 404, 500

#### `PUT /api/control/services/set_available/<int:id>/<int:state>`
- **Descripción**: Establece la disponibilidad de un servicio.
- **Parámetros de ruta**:
  - `id` (entero): ID del servicio
  - `state` (entero): 1 para habilitar, 0 para deshabilitar
- **Límite**: 5 solicitudes por minuto
- **Respuestas**:
  - `200 OK`: Disponibilidad actualizada correctamente
  - `400 Bad Request`: No se puede desactivar un servicio requerido
  - `404 Not Found`: Servicio no encontrado
  - `500 Internal Server Error`: Error al actualizar la disponibilidad
- **Códigos de estado**: 200, 400, 404, 500

### Redirecciones

#### `GET /api/control/redirect/all`
- **Descripción**: Obtiene la lista completa de redirecciones.
- **Límite**: 3 solicitudes por minuto
- **Acceso**: Público
- **Respuestas**:
  - `200 OK`: Lista de redirecciones
  - `500 Internal Server Error`: Error al obtener las redirecciones
- **Códigos de estado**: 200, 500

#### `GET /api/control/redirect/update`
- **Descripción**: Actualiza la lista de redirecciones.
- **Límite**: 10 solicitudes por minuto
- **Acceso**: Público
- **Respuestas**:
  - `200 OK`: Redirecciones actualizadas correctamente
  - `500 Internal Server Error`: Error al actualizar las redirecciones
- **Códigos de estado**: 200, 500

## Endpoints Internos

### Mensajería

#### `POST /api/internal/message/send`
- **Descripción**: Envía un mensaje a un servicio específico a través de un canal.
- **Cuerpo de la solicitud**:
  ```json
  {
    "to_service": "string",
    "channel": "string",
    "data": {}
  }
  ```
- **Respuestas**:
  - `200 OK`: Mensaje enviado correctamente
  - `400 Bad Request`: Datos de solicitud inválidos
  - `500 Internal Server Error`: Error al enviar el mensaje
- **Códigos de estado**: 200, 400, 500

### Servicios Internos

#### `GET /api/internal/services/recolect_perms`
- **Descripción**: Recolecta permisos de todos los servicios registrados.
- **Uso**: Interno del sistema
- **Respuestas**:
  - `200 OK`: Permisos recolectados correctamente
  - `500 Internal Server Error`: Error al recolectar permisos
- **Códigos de estado**: 200, 500

## Límites de Tasa

- **Endpoints de Gateway**: 
  - `/research`: 2 solicitudes por minuto
  - `/research_status`: 5 solicitudes por minuto
  - `/research_stop`: 2 solicitudes por minuto
- **Endpoints de Servicios**: 
  - `/all`: 15 solicitudes por minuto
  - `/get_service/<id>`: 15 solicitudes por minuto
  - Otros: 5 solicitudes por minuto
- **Endpoints de Redirección**: 
  - `/all`: 3 solicitudes por minuto
  - `/update`: 10 solicitudes por minuto
- **Endpoints Internos**: Sin límite de tasa configurado
