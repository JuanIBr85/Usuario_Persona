import { fetchService, HttpMethod, ServiceURL } from "@/utils/fetchUtils";

/**
 * Servicio para la gestión de componentes/servicios del sistema
 * Contiene métodos para gestionar los servicios mediante solicitudes HTTP.
 */
export const componentService = {
  showError: true, // Permite que se muestren errores si ocurre un fallo en las peticiones

  /**
   * Obtener todos los servicios
   * @returns {Promise} Promesa con la lista de servicios
   */
  get_all: async () => {
    return fetchService.fetch({
      url: `${ServiceURL.auth}/control/services/all`,
      method: HttpMethod.GET,
      showError: componentService.showError,
      useToken: true
    });
  },

  /**
   * Obtener un servicio por su ID
   * @param {number} id - ID del servicio a obtener
   * @returns {Promise} Promesa con los datos del servicio
   */
  get_by_id: async (id) => {
    return fetchService.fetch({
      url: `${ServiceURL.auth}/control/services/get_service/${id}`,
      method: HttpMethod.GET,
      showError: componentService.showError,
      useToken: true
    });
  },

  /**
   * Recolectar permisos de todos los servicios
   * @returns {Promise} Promesa con la lista de permisos recolectados
   */
  recolect_perms: async () => {
    return fetchService.fetch({
      url: `${ServiceURL.auth}/control/services/recolect_perms`,
      method: HttpMethod.GET,
      showError: componentService.showError,
      useToken: true
    });
  },

  /**
   * Instalar un nuevo servicio
   * @param {string} url - URL del servicio a instalar
   * @returns {Promise} Promesa con el resultado de la operación
   */
  install_service: async (url) => {
    return fetchService.fetch({
      url: `${ServiceURL.auth}/control/services/install_service`,
      method: HttpMethod.POST,
      body: { url },
      showError: componentService.showError,
      useToken: true
    });
  },

  /**
   * Actualizar la información de un servicio
   * @param {number} id - ID del servicio a actualizar
   * @returns {Promise} Promesa con el servicio actualizado
   */
  refresh_service: async (id) => {
    return fetchService.fetch({
      url: `${ServiceURL.auth}/control/services/refresh_service/${id}`,
      method: HttpMethod.PUT,
      showError: componentService.showError,
      useToken: true
    });
  },

  /**
   * Eliminar un servicio
   * @param {number} id - ID del servicio a eliminar
   * @returns {Promise} Promesa con el resultado de la operación
   */
  remove_service: async (id) => {
    return fetchService.fetch({
      url: `${ServiceURL.auth}/control/services/remove_service/${id}`,
      method: HttpMethod.DELETE,
      showError: componentService.showError,
      useToken: true
    });
  },

  /**
   * Cambiar el estado de disponibilidad de un servicio
   * @param {number} id - ID del servicio
   * @param {boolean} available - Nuevo estado de disponibilidad
   * @returns {Promise} Promesa con el resultado de la operación
   */
  set_service_available: async (id, available) => {
    const state = available ? 1 : 0;
    return fetchService.fetch({
      url: `${ServiceURL.auth}/control/services/set_service_available/${id}/${state}`,
      method: HttpMethod.GET,
      showError: componentService.showError,
      useToken: true
    });
  },
  
  /*
   * Detener todo 
  */ 
 
  stop_system: async () => {
    return fetchService.fetch({
      url: `${ServiceURL.auth}/control/services/stop_system`,
      method: HttpMethod.POST,
      showError: componentService.showError,
      useToken: true
    });
  }
};