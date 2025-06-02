import { fetchService, HttpMethod, ServiceURL } from "@/utils/fetchUtils";

/**
 * Servicio para manejar operaciones de autenticación y registro de usuarios.
 * Proporciona métodos para iniciar sesión y registrar nuevos usuarios.
 * 
 * @namespace AuthService
 */
export const AuthService = {

  /**
   * Controla si se muestran mensajes de error automáticamente.
   * @type {boolean}
   * @default true
   */
  showError: true,

  /**
   * Autentica a un usuario en el sistema.
   * @async
   * @param {Object} body - Credenciales del usuario.
   * @param {string} body.email_usuario - Nombre de usuario.
   * @param {string} body.password - Contraseña del usuario.
   * @returns {Promise<Object>} Promesa que resuelve con la respuesta del servidor.
   */
  login: async (body) => {
    return fetchService.fetch({
      url: `${ServiceURL.auth}/login1`,
      method: HttpMethod.POST,
      body: body,
      showError: AuthService.showError
    });
  },

  /**
   * Registra un nuevo usuario en el sistema.
   * @async
   * @param {Object} body - Datos del nuevo usuario.
   * @param {string} body.nombre_usuario - Nombre de usuario deseado.
   * @param {string} body.password - Contraseña del usuario.
   * @param {string} body.email_usuario - Correo electrónico del usuario.
   * @returns {Promise<Object>} Promesa que resuelve con la respuesta del servidor.
   */
  register: async (body) => {
    return fetchService.fetch({
      url: `${ServiceURL.auth}/registro1`,
      method: HttpMethod.POST,
      body: body,
      showError: AuthService.showError
    });
  }
};