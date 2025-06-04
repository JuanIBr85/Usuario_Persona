
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

  get: async (id) => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/api/personas`,
      method: HttpMethod.GET,
      showError: PersonaService.showError
    });
  },
  
  get_by_usuario: async (id) => {
    return fetchService.fetch({
      url: `${ServiceURL.persona}/api/personas/${id}`,
      method: HttpMethod.GET,
      showError: PersonaService.showError
    });
  }
};