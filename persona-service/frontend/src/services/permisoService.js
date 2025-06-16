import { fetchService, HttpMethod, ServiceURL } from "@/utils/fetchUtils";

/**
 * Servicio para la gestión de permisos
 * Contiene métodos para obtener todos los permisos y asignarlos a roles mediante solicitudes HTTP.
 */
export const permisoService = {
    showError: true, // Permite que se muestren errores si ocurre un fallo en las peticiones

    // Método para obtener todos los permisos disponibles
    get_all: async () => {
        return fetchService.fetch({
            url: `${ServiceURL.auth}/super-admin/permisos`,
            method: HttpMethod.GET,
            showError: permisoService.showError,
            useToken: true,
        })
    },

    // Método para asignar permisos a un rol específico
    asignarPermisos: async (idRol, permisos) => {
        return fetchService.fetch({
            url: `${ServiceURL.auth}/super-admin/admins/permisos/${idRol}`,
            method: HttpMethod.POST,
            body: { permisos }, // Cuerpo de la solicitud: contiene la lista de permisos a asignar
            showError: permisoService.showError,
            headers: { // Encabezados HTTP que indican que el contenido enviado es JSON
                "Content-Type": "application/json",
            },
            useToken: true,
        });
    },
};