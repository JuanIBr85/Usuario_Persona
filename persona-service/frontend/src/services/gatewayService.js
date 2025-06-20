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
      url: `${ServiceURL.auth}/control/gateway/research`,
      method: HttpMethod.GET,
      showError: gatewayService.showError,
      useToken: true
    });
  },

  /**
   * Obtiene el estado actual de la investigación de endpoints
   * @returns {Promise} Promesa con el estado de la investigación y el registro de eventos
   */
  getResearchStatus: async () => {
    return fetchService.fetch({
      url: `${ServiceURL.auth}/control/gateway/research_status`,
      method: HttpMethod.GET,
      showError: gatewayService.showError,
      useToken: true
    });
  },

  /**
   * Detiene la investigación de endpoints en curso
   * @returns {Promise} Promesa con el resultado de la operación
   */
  stopResearch: async () => {
    return fetchService.fetch({
      url: `${ServiceURL.auth}/control/gateway/reserch_stop`,
      method: HttpMethod.GET,
      showError: gatewayService.showError,
      useToken: true
    });
  }
};