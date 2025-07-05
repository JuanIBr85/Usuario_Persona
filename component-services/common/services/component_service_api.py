import os
from common.services.service_request import ServiceRequest


COMPONENT_SERVICE_HOST = os.environ.get(
    "COMPONENT_SERVICE_HOST", "localhost"
)
COMPONENT_SERVICE_URL = f"http://{COMPONENT_SERVICE_HOST}:5002"

class ComponentServiceApi:
    """
    Servicio que permite la comunicación con el servicio de componentes.
    Contiene todas las rutas del servicio.

    Nota: 
        - Este es un servicio interno del sistema, por lo que no se debe usar directamente si no es necesario.
        - Si se crea un nuevo componente para mensajes simples se recomienda usar los mensajes entre componentes en lugar de usar estos servicios.
    """

    @staticmethod
    def _request_to(path:str, method:str="GET", data=None, json=None, headers=None):
        return ServiceRequest.request(method, f"{COMPONENT_SERVICE_URL}/{path}", data=data, json=json, headers=headers)

    @staticmethod
    def control_gateway_research():
        """
        Descripción: Inicia una búsqueda en segundo plano para actualizar los endpoints disponibles.
        
        Respuestas:
        - `202 Accepted`: Búsqueda iniciada correctamente o ya en progreso
        - `200 OK`: Búsqueda iniciada correctamente
        
        Códigos de estado: 200, 202
        """
        
        return ComponentServiceApi._request_to("api/control/gateway/research", "GET")

    @staticmethod
    def control_gateway_research_status():
        """
        Descripción: Obtiene el estado actual de la búsqueda de endpoints.
        
        Respuestas:
        - `200 OK`: Devuelve el estado de la búsqueda con la siguiente estructura:
            ```json
            {
                "search_in_progress": boolean,
                "log": [string]
            }
            ```
            
        Códigos de estado: 200
        """
        return ComponentServiceApi._request_to("api/control/gateway/research_status", "GET")
        
    @staticmethod
    def control_gateway_research_stop():
        """
        Descripción: Detiene la búsqueda de endpoints en curso.
        
        Respuestas:
        - `200 OK`: Búsqueda detenida correctamente
            
        Códigos de estado: 200
        """
        return ComponentServiceApi._request_to("api/control/gateway/research_stop", "GET")

    # Control Redirect
    @staticmethod
    def control_redirect_all():
        """
        Descripción: Obtiene la lista completa de redirecciones.
        
        Respuestas:
        - `200 OK`: Lista de redirecciones
        - `500 Internal Server Error`: Error al obtener las redirecciones
            
        Códigos de estado: 200, 500
        """
        return ComponentServiceApi._request_to("api/control/redirect/all", "GET")
        
    @staticmethod
    def control_redirect_update():
        """
        Descripción: Actualiza la lista de redirecciones.
        
        Respuestas:
        - `200 OK`: Redirecciones actualizadas correctamente
        - `500 Internal Server Error`: Error al actualizar las redirecciones
            
        Códigos de estado: 200, 500
        """
        return ComponentServiceApi._request_to("api/control/redirect/update", "GET")
        
    @staticmethod
    def control_redirect_get(code: str):
        """
        Descripción: Obtiene una redirección específica por su código.
        
        Parámetros:
        - `code` (str): Código de la redirección a consultar
        
        Respuestas:
        - `200 OK`: Redirección encontrada
        - `404 Not Found`: Redirección no encontrada
        - `500 Internal Server Error`: Error al obtener la redirección
            
        Códigos de estado: 200, 404, 500
        """
        return ComponentServiceApi._request_to(f"api/control/redirect/get/{code}", "GET")
    
    # Control Services
    @staticmethod
    def control_services_echo():
        """
        Descripción: Endpoint de prueba para verificar la conectividad con el servicio.
        
        Respuestas:
        - `200 OK`: El servicio está en línea y respondiendo
            
        Códigos de estado: 200
        """
        return ComponentServiceApi._request_to("api/control/services/echo", "GET")
        
    @staticmethod
    def control_services_all():
        """
        Descripción: Obtiene todos los servicios registrados con su estado de salud.
        
        Respuestas:
        - `200 OK`: Lista de servicios con su estado de salud
        - `500 Internal Server Error`: Error al obtener los servicios
            
        Códigos de estado: 200, 500
        """
        return ComponentServiceApi._request_to("api/control/services/all", "GET")
        
    @staticmethod
    def control_services_get(id: int):
        """
        Descripción: Obtiene un servicio específico por su ID con su estado de salud.
        
        Parámetros:
        - `id` (int): ID del servicio a consultar
        
        Respuestas:
        - `200 OK`: Servicio encontrado
        - `404 Not Found`: Servicio no encontrado
        - `500 Internal Server Error`: Error al obtener el servicio
            
        Códigos de estado: 200, 404, 500
        """
        return ComponentServiceApi._request_to(f"api/control/services/get_service/{id}", "GET")
        
    @staticmethod
    def control_services_refresh(id: int):
        """
        Descripción: Actualiza la información de un servicio existente.
        
        Parámetros:
        - `id` (int): ID del servicio a actualizar
        
        Respuestas:
        - `200 OK`: Servicio actualizado correctamente
        - `400 Bad Request`: Error al conectar con el servicio
        - `404 Not Found`: Servicio no encontrado
        - `500 Internal Server Error`: Error al actualizar el servicio
            
        Códigos de estado: 200, 400, 404, 500
        """
        return ComponentServiceApi._request_to(f"api/control/services/refresh_service/{id}", "PUT")
        
    @staticmethod
    def control_services_install(data: dict):
        """
        Descripción: Instala un nuevo servicio.
        
        Parámetros:
        - `data` (dict): Datos del servicio a instalar, debe contener la URL:
            ```json
            {
                "url": "string"
            }
            ```
            
        Respuestas:
        - `200 OK`: Servicio instalado correctamente
        - `400 Bad Request`: URL inválida o servicio ya existe
        - `500 Internal Server Error`: Error al instalar el servicio
            
        Códigos de estado: 200, 400, 500
        """
        return ComponentServiceApi._request_to("api/control/services/install_service", "POST", json=data)
        
    @staticmethod
    def control_services_remove(id: int):
        """
        Descripción: Elimina un servicio.
        
        Parámetros:
        - `id` (int): ID del servicio a eliminar
            
        Respuestas:
        - `200 OK`: Servicio eliminado correctamente
        - `400 Bad Request`: No se puede eliminar un servicio core
        - `404 Not Found`: Servicio no encontrado
        - `500 Internal Server Error`: Error al eliminar el servicio
            
        Códigos de estado: 200, 400, 404, 500
        """
        return ComponentServiceApi._request_to(f"api/control/services/remove_service/{id}", "DELETE")
        
    @staticmethod
    def control_services_set_available(id: int, state: int):
        """
        Descripción: Establece la disponibilidad de un servicio.
        
        Parámetros:
        - `id` (int): ID del servicio
        - `state` (int): 1 para habilitar, 0 para deshabilitar
            
        Respuestas:
        - `200 OK`: Disponibilidad actualizada correctamente
        - `400 Bad Request`: No se puede desactivar un servicio requerido
        - `404 Not Found`: Servicio no encontrado
        - `500 Internal Server Error`: Error al actualizar la disponibilidad
            
        Códigos de estado: 200, 400, 404, 500
        """
        return ComponentServiceApi._request_to(f"api/control/services/set_service_available/{id}/{state}", "PUT")
        
    @staticmethod
    def control_services_stop_system():
        """
        Descripción: Detiene el sistema de manera controlada.
        
        Respuestas:
        - `200 OK`: Sistema detenido correctamente
        - `500 Internal Server Error`: Error al detener el sistema
            
        Códigos de estado: 200, 500
        """
        return ComponentServiceApi._request_to("api/control/services/stop_system", "GET")
    
    # Internal Message
    @staticmethod
    def internal_message_send(data: dict):
        """
        Descripción: Envía un mensaje a un servicio específico a través de un canal.
        
        Parámetros:
        - `data` (dict): Datos del mensaje a enviar:
            ```json
            {
                "to_service": "string",
                "channel": "string",
                "data": {}
            }
            ```
            
        Respuestas:
        - `200 OK`: Mensaje enviado correctamente
        - `400 Bad Request`: Datos de solicitud inválidos
        - `500 Internal Server Error`: Error al enviar el mensaje
            
        Códigos de estado: 200, 400, 500
        """
        return ComponentServiceApi._request_to("internal/message/send", "POST", json=data)
    
    # Internal Services
    @staticmethod
    def internal_services_recolect_perms():
        """
        Descripción: Recolecta permisos de todos los servicios registrados.
        
        Nota: Este es un endpoint interno del sistema.
        
        Respuestas:
        - `200 OK`: Permisos recolectados correctamente
        - `500 Internal Server Error`: Error al recolectar permisos
            
        Códigos de estado: 200, 500
        """
        return ComponentServiceApi._request_to("internal/services/recolect_perms", "GET")