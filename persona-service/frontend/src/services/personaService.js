import { fetchService, HttpMethod, ServiceURL } from "@/utils/fetchUtils";

/**
 * Servicio para interactuar con el backend de persona.
 * Contiene funciones para CRUD y validaciones relacionadas con personas.
 */
export const PersonaService = {

  showError: true,

  // ====== CRUD PERSONAS ======

  //Crea una nueva persona.
  crear: async (body) => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/crear_persona`,
      method: HttpMethod.POST,
      body: body,
      useToken: true,
      showError: PersonaService.showError
    });
  },
  crear_perfil: async (body) => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/crear_persona_restringido`,
      method: HttpMethod.POST,
      body: body,
      useToken: true,
      showError: PersonaService.showError
    });
  },
  
  //Obtiene todas las personas.
  get_all: async () => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/personas`,
      method: HttpMethod.GET,
      useToken: true,
      showError: PersonaService.showError
    });
  },

  //Obtiene una persona por su ID.
  get_by_id: async (id) => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/personas/${id}`,
      method: HttpMethod.GET,
      useToken: true,
      showError: PersonaService.showError
    });
  },

  //Edita una persona existente.
  editar: async (id, body) => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/modificar_persona/${id}`,
      method: HttpMethod.PUT,
      body: body,
      useToken: true,
      showError: PersonaService.showError
    });
  },

  //Edita una persona con permisos restringidos.
  editar_restringido: async (body) => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/modificar_persona_restringido`,
      method: HttpMethod.PUT,
      body: body,
      useToken: true,
      showError: PersonaService.showError
    });
  },

  //Elimina una persona por su ID.
  borrar: async (id) => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/borrar_persona/${id}`,
      method: HttpMethod.DELETE,
      useToken: true,
      showError: PersonaService.showError
    });
  },

  // ===========================

  //Obtiene una persona asociada a un usuario específico.
  get_by_usuario: async (id) => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/personas_by_usuario/${id}`,
      method: HttpMethod.GET,
      useToken: true,
      showError: PersonaService.showError
    });
  },

  //Obtiene los tipos de documentos válidos.
  get_tipos_documentos: async () => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/tipos_documento`,
      method: HttpMethod.GET,
      useToken: true,
      showError: PersonaService.showError
    });
  },

  //Obtiene las redes sociales válidas.
  get_redes_sociales: async () => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/redes_sociales`,
      method: HttpMethod.GET,
      useToken: true,
      showError: PersonaService.showError
    });
  },

  //Busca localidades según el código postal.
  get_localidades_by_codigo_postal: async (codigo_postal) => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/domicilios_postales/localidades?codigo_postal=${codigo_postal}`,
      method: HttpMethod.GET,
      useToken: true,
      showError: PersonaService.showError
    });
  },

  //Obtiene la cantidad total de personas.
  get_count: async () => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/personas/count`,
      method: HttpMethod.GET,
      useToken: true,
      showError: PersonaService.showError
    });
  },

  //Obtiene los estados civiles válidos.
  get_estados_civiles: async () => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/estados_civiles`,
      method: HttpMethod.GET,
      useToken: true,
      showError: PersonaService.showError
    });
  },

  //Obtiene las ocupaciones válidas.
  get_ocupaciones: async () => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/ocupaciones`,
      method: HttpMethod.GET,
      useToken: true,
      showError: PersonaService.showError
    });
  },

  //Obtiene los niveles de estudios alcanzados válidos.
  get_estudios_alcanzados: async () => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/estudios_alcanzados`,
      method: HttpMethod.GET,
      useToken: true,
      showError: PersonaService.showError
    });
  },

  // ===== VERIFICACIÓN / VINCULACIÓN =====

  //Verifica si un documento ya está registrado.
  verificar_documento: async (body) => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/opciones/verificar-documento`,
      method: HttpMethod.POST,
      body: body,
      useToken: true,
      showError: PersonaService.showError
    });
  },

  //Verifica un email (envía código OTP).
  verificar_email: async (body) => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/personas/verify`,
      method: HttpMethod.POST,
      body: body,
      useToken: true,
      showError: PersonaService.showError
    });
  },

  //Verifica un código OTP recibido por email.
  verificar_otp: async (body) => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/personas/verify-otp`,
      method: HttpMethod.POST,
      body: body,
      useToken: true,
      showError: PersonaService.showError
    });
  },

  //Obtiene la persona vinculada al usuario autenticado actual.
  persona_by_usuario: async () => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/persona_by_id`,
      method: HttpMethod.GET,
      useToken: true,
      showError: PersonaService.showError
    });
  },

    //Obtiene la persona vinculada al usuario autenticado actual.
    verificar_identidad: async (body) => {
      return fetchService.fetch({
        url: `${ServiceURL.persona}/personas/verificar-identidad`,
        method: HttpMethod.POST,
        body: body,
        useToken: true,
        showError: PersonaService.showError
      });
    }

};