# Component Services API

Documentación de los endpoints disponibles en el servicio de componentes.

## Endpoints de Gateway

- `/api/control/gateway/research` (GET): Inicia una búsqueda en segundo plano para actualizar los endpoints disponibles.
- `/api/control/gateway/research_status` (GET): Obtiene el estado actual de la búsqueda de endpoints.
- `/api/control/gateway/reserch_stop` (GET): Detiene la búsqueda de endpoints en curso.

## Endpoints de Servicios

- `/api/control/services/all` (GET): Obtiene todos los servicios registrados.
- `/api/control/services/get_service/<int:id>` (GET): Obtiene un servicio específico por su ID.
- `/api/control/services/add_service` (POST): Agrega un nuevo servicio.
- `/api/control/services/delete_service/<int:id>` (DELETE): Elimina un servicio existente.
- `/api/control/services/update_service/<int:id>` (PUT): Actualiza un servicio existente.

## Límites de tasa

- Los endpoints de gateway tienen un límite de 2 solicitudes por minuto.
- Los endpoints de servicios tienen un límite de 5 solicitudes por minuto.
