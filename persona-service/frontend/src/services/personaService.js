import { fetchService, HttpMethod, ServiceURL } from "@/utils/fetchUtils";

export const PersonaService = {

  showError: true,

  // ====== CRUD PERSONAS ======
  crear: async (body) => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/api/crear_persona`,
      method: HttpMethod.POST,
      body: body,
      useToken: true,
      showError: PersonaService.showError
    });
  },

  get_all: async () => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/api/personas`,
      method: HttpMethod.GET,
      useToken: true,
      showError: PersonaService.showError
    });
  },

  get_by_id: async (id) => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/api/personas/${id}`,
      method: HttpMethod.GET,
      useToken: true,
      showError: PersonaService.showError
    });
  },


  editar: async (id, body) => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/api/modificar_persona/${id}`,
      method: HttpMethod.PUT, 
      body: body,
      useToken: true,
      showError: PersonaService.showError
    });
  },

  borrar: async (id) => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/api/borrar_persona/${id}`,
      method: HttpMethod.DELETE,

      useToken: true,
      showError: PersonaService.showError
    });
  },
  // ===========================

  get_by_usuario: async (id) => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/api/personas_by_usuario/${id}`,
      method: HttpMethod.GET,
      useToken: true,
      showError: PersonaService.showError
    });
  },

  get_tipos_documentos: async () => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/api/tipos_documento`,
      method: HttpMethod.GET,
      useToken: true,
      showError: PersonaService.showError
    });
  },

  get_redes_sociales: async () => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/api/redes_sociales`,
      method: HttpMethod.GET,
      useToken: true,
      showError: PersonaService.showError
    });
  },

  get_localidades_by_codigo_postal: async (codigo_postal) => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/api/domicilios_postales/localidades?codigo_postal=${codigo_postal}`,
      method: HttpMethod.GET,
      useToken: true,
      showError: PersonaService.showError
    });
  },
};