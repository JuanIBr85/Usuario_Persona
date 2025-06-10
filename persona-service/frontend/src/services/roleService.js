import { fetchService, HttpMethod, ServiceURL } from "@/utils/fetchUtils";

/**
 * Servicio para la gestión de roles
 * Contiene métodos para crear, obtener y eliminar roles mediante solicitudes HTTP.
 */
export const roleService = {
  showError: true, // Permite que se muestren errores si ocurre un fallo en las peticiones


  // Metodo para crear un nuevo rol
  crear: async (body) => {
    return fetchService.fetch({
      url: `${ServiceURL.auth}/super-admin/roles`,
      method: HttpMethod.POST,
      showError: roleService.showError,
      body: body,
      useToken: true
    })
  },


  // Metodo para obtener la lista completa de roles
  get_all: async () => {
    return fetchService.fetch({
      url: `${ServiceURL.auth}/super-admin/roles`,
      method: HttpMethod.GET,
      showError: roleService.showError,
      useToken: true,
      showError: true,
    });
  },


  // Método para eliminar un rol específico utilizando su ID
  borrar: async (id) => {
    return fetchService.fetch({
      url: `${ServiceURL.auth}/super-admin/roles/${id}`,
      method: HttpMethod.DELETE,
      showError: roleService.showError,
      useToken: true
    });
  },
};