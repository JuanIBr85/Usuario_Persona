import { fetchService, HttpMethod, ServiceURL } from "@/utils/fetchUtils";

/**
 * Servicio para la gestión del gateway y descubrimiento de endpoints
 * Contiene métodos para gestionar la investigación de endpoints en el sistema
 */
export const gatewayService = {
  showError: true, // Permite que se muestren errores si ocurre un fallo en las peticiones

  /**
   * Inicia la investigación de endpoints en segundo plano
   * @returns {Promise} Promesa con el resultado de la operación
   */
  startResearch: async () => {
    return fetchService.fetch({
      url: `${ServiceURL.control}/gateway/research`,
      method: HttpMethod.GET,
      showError: gatewayService.showError,
      useToken: true,
    });
  },

  /**
   * Obtiene el estado actual de la investigación de endpoints
   * @returns {Promise} Promesa con el estado de la investigación y el registro de eventos
   */
  getResearchStatus: async () => {
    return fetchService.fetch({
      url: `${ServiceURL.control}/gateway/research_status`,
      method: HttpMethod.GET,
      showError: gatewayService.showError,
      useToken: true,
    });
  },

  /**
   * Detiene la investigación de endpoints en curso
   * @returns {Promise} Promesa con el resultado de la operación
   */
  stopResearch: async () => {
    return fetchService.fetch({
      url: `${ServiceURL.control}/gateway/research_stop`,
      method: HttpMethod.GET,
      showError: gatewayService.showError,
      useToken: true,
    });
  },

  // ==== Endpoints de servicios ====

  /**
   * Obtiene todos los servicios registrados con su estado de salud
   * @returns {Promise}
   */
  getAllServices: async () => {
    return fetchService.fetch({
      url: `${ServiceURL.control}/services/all`,
      method: HttpMethod.GET,
      showError: gatewayService.showError,
      useToken: true,
    });
  },

  /**
   * Obtiene un servicio específico por ID con su estado de salud
   * @param {number} id ID del servicio
   * @returns {Promise}
   */
  getServiceById: async (id) => {
    return fetchService.fetch({
      url: `${ServiceURL.control}/services/get_service/${id}`,
      method: HttpMethod.GET,
      showError: gatewayService.showError,
      useToken: true,
    });
  },

  /**
   * Recolecta permisos de todos los servicios registrados
   * @returns {Promise}
   */
  collectPermissions: async () => {
    return fetchService.fetch({
      url: `${ServiceURL.control}/services/recolect_perms`,
      method: HttpMethod.GET,
      showError: gatewayService.showError,
      useToken: true,
    });
  },

  /**
   * Instala un nuevo servicio
   * @param {object} url url para crear el servicio
   * @returns {Promise}
   */
  installService: async (url) => {
    return fetchService.fetch({
      url: `${ServiceURL.control}/services/install_service`,
      method: HttpMethod.POST,
       body: { url },
      showError: gatewayService.showError,
      useToken: true,
    });
  },

  /**
   * Actualiza un servicio existente por ID
   * @param {number} id ID del servicio
   * @param {object} body Datos para actualizar
   * @returns {Promise}
   */
  refreshService: async (id, body) => {
    return fetchService.fetch({
      url: `${ServiceURL.control}/services/refresh_service/${id}`,
      method: HttpMethod.PUT,
      body: body,
      showError: gatewayService.showError,
      useToken: true,
    });
  },

  /**
   * Elimina un servicio por ID
   * @param {number} id ID del servicio
   * @returns {Promise}
   */
  removeService: async (id) => {
    return fetchService.fetch({
      url: `${ServiceURL.control}/services/remove_service/${id}`,
      method: HttpMethod.DELETE,
      showError: gatewayService.showError,
      useToken: true,
    });
  },

  /**
   * Establece la disponibilidad de un servicio
   * @param {number} id ID del servicio
   * @param {number} state Estado (1 = disponible, 0 = no disponible)
   * @returns {Promise}
   */
  setServiceAvailable: async (id, state) => {
    return fetchService.fetch({
      url: `${ServiceURL.control}/services/set_service_available/${id}/${state}`,
      method: HttpMethod.PUT,
      showError: gatewayService.showError,
      useToken: true,
    });
  },

  /**
   * Obtiene todos los endpoints disponibles
   * @returns {Promise}
   */
  getAllEndpoints: async () => {
    return fetchService.fetch({
      url: `${ServiceURL.control}/gateway/get_all_endpoints`,
      method: HttpMethod.GET,
      showError: gatewayService.showError,
      useToken: true,
    });
  },
};
