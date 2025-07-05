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
      url: `${ServiceURL.auth}/login`,
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
    console.log("Datos enviados:", body);

    return fetchService.fetch({
      url: `${ServiceURL.auth}/registro`,
      method: HttpMethod.POST,  
      body: body,
      
      showError: AuthService.showError
    });
  },

  /**
   * Solicita un código OTP para la autenticación de dos factores.
   * @async
   * @param {Object} body - Datos necesarios para solicitar el OTP.
   * @param {string} body.email_usuario - Correo electrónico del usuario.
   * @returns {Promise<Object>} Promesa que resuelve con la respuesta del servidor.
   */
  requestOtp: async (body) => {
    return fetchService.fetch({
      url: `${ServiceURL.auth}/solicitar-otp`,
      method: HttpMethod.POST,
      body: body,
      
      showError: AuthService.showError
    });
  },


  resendOtp: async (body) => {
    return fetchService.fetch({
      url: `${ServiceURL.auth}/resend-otp`,
      method: HttpMethod.POST,
      body: body,
      
      showError: AuthService.showError
    });
  },

  /**
   * Valida un código OTP proporcionado por el usuario.
   * @async
   * @param {Object} body - Datos necesarios para validar el OTP.
   * @param {string} body.otp - Código OTP proporcionado por el usuario.
   * @returns {Promise<Object>} Promesa que resuelve con la respuesta del servidor.
   */
  validateOtp: async (body) => {
    return fetchService.fetch({
      url: `${ServiceURL.auth}/verificar-otp`,
      method: HttpMethod.POST,
      body: body,
      
      showError: AuthService.showError
    });
  },
  
  verificarEmail: async (body) => {
    return fetchService.fetch({
      url: `${ServiceURL.auth}/verificar-email`,
      method: HttpMethod.POST,
      body: body,
      
      showError: AuthService.showError
    });
  },

  /**
 * Cambia la contraseña usando un token temporal después de verificar OTP.
 * @async
 * @param {Object} body - Contiene la nueva contraseña y confirmación.
 * @param {string} token - Token temporal recibido después de verificar OTP.
 * @returns {Promise<Object>} Promesa que resuelve con la respuesta del servidor.
 */
resetPassword: async (body, token) => {
  return fetchService.fetch({
    url: `${ServiceURL.auth}/reset-password-con-codigo`,
    method: HttpMethod.POST,
    body: {...body, token:token},
    showError: AuthService.showError
  });
},

logout: async () => {
  return fetchService.fetch({
    url: `${ServiceURL.auth}/logout`,
    method: HttpMethod.POST,
    useToken: true,
    showError: AuthService.showError
  });
  },
   
  updateUser: async (body) => {
    return fetchService.fetch({
      url: `${ServiceURL.auth}/modificar`,
      method: HttpMethod.POST,
      body: body,
      useToken: true,
      showError: AuthService.showError,
    });
  },

  deleteUser: async () => {
    return fetchService.fetch({
      url: `${ServiceURL.auth}/eliminar`,
      method: HttpMethod.DELETE,
      useToken: true,
      showError: AuthService.showError,
    });
  },

};