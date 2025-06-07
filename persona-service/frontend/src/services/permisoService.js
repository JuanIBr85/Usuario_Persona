import { fetchService, HttpMethod, ServiceURL } from "@/utils/fetchUtils";

export const permisoService = {
  showError: true,

  get_all: async () => {
    return fetchService.fetch({
      url: `${ServiceURL.auth}/super-admin/permisos`,
      method: HttpMethod.GET,
      showError: permisoService.showError,
    })
  },
};