import { fetchService, HttpMethod, ServiceURL } from "@/utils/fetchUtils";

export const PersonaService = {

  showError: true,

  crear: async (body) => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/api/crear_persona`,
      method: HttpMethod.POST,
      body: body,
      showError: PersonaService.showError
    });
  },

  // Esto sirve para ver los datos de todos los usuarios en AdminUsers.jsx 
  get: async () => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/api/personas`,
      method: HttpMethod.GET,
      showError: PersonaService.showError
    });
  },

  // Esto sirve para ver los datos completos de un usuario en UserDetails.jsx 
  get_by_id: async (id) => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/api/personas/${id}`,
      method: HttpMethod.GET,
      showError: PersonaService.showError
    });
  },

  get_by_usuario: async (id) => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/api/personas_by_usuario/${id}`,
      method: HttpMethod.GET,
      showError: PersonaService.showError
    });
  },

  // Esto sirve para ver editar datos de un usuario en AdminUsers.jsx 
  editar: async (id, body) => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/api/modificar_persona/${id}`,
      method: HttpMethod.PUT,
      body: body,
      showError: PersonaService.showError
    });
  },

  // Esto sirve para borrar los datos de un usuario en AdminUsers.jsx 
  borrar: async (id) => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/api/borrar_persona/${id}`,
      method: HttpMethod.DELETE,
      showError: PersonaService.showError
    });
  },

  get_tipos_documentos: async () => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/api/tipos_documento`,
      method: HttpMethod.GET,
      showError: PersonaService.showError
    });
  },
};