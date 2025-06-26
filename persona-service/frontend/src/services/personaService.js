import { fetchService, HttpMethod, ServiceURL } from "@/utils/fetchUtils";

export const PersonaService = {

  showError: true,

  // ====== CRUD PERSONAS ======
  crear: async (body) => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/crear_persona`,
      method: HttpMethod.POST,
      body: body,
      useToken: true,
      showError: PersonaService.showError
    });
  },

  get_all: async () => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/personas`,
      method: HttpMethod.GET,
      useToken: true,
      showError: PersonaService.showError
    });
  },

  get_by_id: async (id) => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/personas/${id}`,
      method: HttpMethod.GET,
      useToken: true,
      showError: PersonaService.showError
    });
  },


  editar: async (id, body) => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/modificar_persona/${id}`,
      method: HttpMethod.PUT,
      body: body,
      useToken: true,
      showError: PersonaService.showError
    });
  },

  editar_restringido: async (body) => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/modificar_persona_restringido`,
      method: HttpMethod.PUT,
      body: body,
      useToken: true,
      showError: PersonaService.showError
    });
  },

  

  borrar: async (id) => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/borrar_persona/${id}`,
      method: HttpMethod.DELETE,

      useToken: true,
      showError: PersonaService.showError
    });
  },
  // ===========================

  get_by_usuario: async (id) => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/personas_by_usuario/${id}`,
      method: HttpMethod.GET,
      useToken: true,
      showError: PersonaService.showError
    });
  },

  get_tipos_documentos: async () => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/tipos_documento`,
      method: HttpMethod.GET,
      useToken: true,
      showError: PersonaService.showError
    });
  },

  get_redes_sociales: async () => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/redes_sociales`,
      method: HttpMethod.GET,
      useToken: true,
      showError: PersonaService.showError
    });
  },

  get_localidades_by_codigo_postal: async (codigo_postal) => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/domicilios_postales/localidades?codigo_postal=${codigo_postal}`,
      method: HttpMethod.GET,
      useToken: true,
      showError: PersonaService.showError
    });
  },

  get_count: async () => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/personas/count`,
      method: HttpMethod.GET,
      useToken: true,
      showError: PersonaService.showError
    });
  },

  get_estados_civiles: async () => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/estados_civiles`,
      method: HttpMethod.GET,
      useToken: true,
      showError: PersonaService.showError
    });
  },
  get_ocupaciones: async () => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/ocupaciones`,
      method: HttpMethod.GET,
      useToken: true,
      showError: PersonaService.showError
    });
  },
  get_estudios_alcanzados: async () => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/estudios_alcanzados`,
      method: HttpMethod.GET,
      useToken: true,
      showError: PersonaService.showError
    });
  },
  //===========================================
  //Rutas de verificacion y vinculacion de persona
  verificar_documento: async (body) => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/opciones/verificar-documento`,
      method: HttpMethod.POST,
      body: body,
      useToken: true,
      showError: PersonaService.showError
    });
  },

  verificar_email: async (body) => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/personas/verify`,
      method: HttpMethod.POST,
      body: body,
      useToken: true,
      showError: PersonaService.showError
    });
  },

  verificar_otp: async (body) => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/personas/verify-otp`,
      method: HttpMethod.POST,
      body: body,
      useToken: true,
      showError: PersonaService.showError
    });
  },

  persona_by_usuario: async () => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/persona_by_id`,
      method: HttpMethod.GET,
      useToken: true,
      showError: PersonaService.showError
    });
  }

};

