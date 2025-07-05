# Component Services API

Documentación de los endpoints disponibles en el servicio de componentes.

## Endpoints de Gateway

- `/api/control/gateway/research` (GET): Inicia una búsqueda en segundo plano para actualizar los endpoints disponibles.
- `/api/control/gateway/research_status` (GET): Obtiene el estado actual de la búsqueda de endpoints, incluyendo si está en progreso y el registro de búsqueda.
- `/api/control/gateway/research_stop` (GET): Detiene la búsqueda de endpoints en curso.

## Endpoints de Servicios

- `/api/control/services/all` (GET): Obtiene todos los servicios registrados con su estado de salud.
- `/api/control/services/get_service/<int:id>` (GET): Obtiene un servicio específico por su ID con su estado de salud.
- `/api/control/services/recolect_perms` (GET): Recolecta permisos de todos los servicios registrados.
- `/api/control/services/install_service` (POST): Instala un nuevo servicio.
- `/api/control/services/refresh_service/<int:id>` (PUT): Actualiza la información de un servicio existente.
- `/api/control/services/remove_service/<int:id>` (DELETE): Elimina un servicio.
- `/api/control/services/set_available/<int:id>/<int:state>` (PUT): Establece la disponibilidad de un servicio.

## Límites de tasa

- Los endpoints de gateway tienen un límite de 2 solicitudes por minuto.
- Los endpoints de servicios tienen un límite de 5 solicitudes por minuto.
