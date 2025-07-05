import { fetchService, HttpMethod, ServiceURL } from "@/utils/fetchUtils";

/**
 * Servicio para la gestión de usuarios
 * Contiene métodos para obtener, actualizar, crear y eliminar usuarios mediante solicitudes HTTP.
 */
export const userService = {
  showError: true, // Permite que se muestren errores si ocurre un fallo en las peticiones

  // Método para obtener todos los usuarios
  getAllUsers: async () => {
    return fetchService.fetch({
      url: `${ServiceURL.auth}/super-admin/usuarios`,
      method: HttpMethod.GET,
      showError: userService.showError,
      useToken: true,
    });
  },

  // Método para actualizar un usuario existente por ID
  updateUser: async (id, body) => {
    return fetchService.fetch({
      url: `${ServiceURL.auth}/super-admin/usuarios/${id}`,
      method: HttpMethod.PUT,
      showError: userService.showError,
      body,
      useToken: true,
      headers: {
        "Content-Type": "application/json",
      },
    });
  },

  // Método para crear un nuevo usuario
  createUser: async (body) => {
    return fetchService.fetch({
      url: `${ServiceURL.auth}/super-admin/admins`,
      method: HttpMethod.POST,
      showError: userService.showError,
      body,
      useToken: true,
      headers: {
        "Content-Type": "application/json",
      },
    });
  },

  // Método para eliminar un usuario por ID
  deleteUser: async (id) => {
    return fetchService.fetch({
      url: `${ServiceURL.auth}/super-admin/usuarios/${id}`,
      method: HttpMethod.DELETE,
      showError: userService.showError,
      useToken: true,
    });
  },
};
