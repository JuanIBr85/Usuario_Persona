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

    asignarPermisos: async (idRol, permisos) => {
        return fetchService.fetch({
            url: `${ServiceURL.auth}/super-admin/admins/${idRol}/permisos`,
            method: HttpMethod.POST,
            body: { permisos },
            showError: permisoService.showError,
            headers: {
                "Content-Type": "application/json",
            },
        });
    },
};