import { API_URL, HttpMethod, fetchService } from "@/utils/fetchUtils";


export const a = async() => {
    await fetchService.useDefaultUrl({
        url: "api/crear_tipo_documento",
        method: HttpMethod.POST,
        body: {
            tipo_documento: "DNI",
        },
    }).then(response => {
        console.log("Tipo de documento creado:", response);
    }).catch(error => {
        console.error("Error al crear tipo de documento:", error);
    });

    await fetchService.useDefaultUrl({
        url: "api/tipos_documento",
        method: HttpMethod.GET,
    }).then(response => {
        console.log("Tipos de documento:", response);
    }).catch(error => {
        console.error("Error al obtener tipos de documento:", error);
    });

    await fetchService.useDefaultUrl({
        url: "api/tipos_documento/1",
        method: HttpMethod.GET,
    }).then(response => {
        console.log("Tipo de documento por ID:", response);
    }).catch(error => {
        console.error("Error al obtener tipo de documento por ID:", error);
    });

    await fetchService.useDefaultUrl({
        url: "api/actualizar_tipo_documento/1",
        method: HttpMethod.PUT,
        body: {
            tipo_documento: "DNI actualizado",
        },
    }).then(response => {
        console.log("Tipo de documento actualizado:", response);
    }).catch(error => {
        console.error("Error al actualizar tipo de documento:", error);
    });

    await fetchService.useDefaultUrl({
        url: "api/eliminar_tipo_documento/1",
        method: HttpMethod.DELETE,
    }).then(response => {
        console.log("Tipo de documento eliminado:", response);
    }).catch(error => {
        console.error("Error al eliminar tipo de documento:", error);
    });
}