import { fetchService, HttpMethod, ServiceURL } from "@/utils/fetchUtils";

export const roleService = {
  showError: true,

  get_all: async () => {
    return fetchService.fetch({
      url: `${ServiceURL.auth}/super-admin/roles`,
      method: HttpMethod.GET,
      showError: roleService.showError
    });
  },

  borrar: async (id) => {
    return fetchService.fetch({
      url: `${ServiceURL.auth}/super-admin/roles/${id}`,
      method: HttpMethod.DELETE,
      showError: roleService.showError,
      useToken: true
    });
  },

};
