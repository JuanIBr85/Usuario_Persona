import { fetchService, HttpMethod } from './fetchUtils';

export async function getAllRoles() {
  return await fetchService.useDefaultUrl({
    url: "api/roles",
    method: HttpMethod.GET,
  }).catch(error => {
    console.error("Error al obtener los roles:", error);
    throw new Error('Error al obtener los roles');
  });
}

export async function getRoleById(id) {
  return await fetchService.useDefaultUrl({
    url: `api/roles/${id}`,
    method: HttpMethod.GET,
  }).catch(error => {
    console.error("Error al obtener rol por ID:", error);
    throw new Error('Rol no encontrado');
  });
}

export async function createRole(roleData) {
  return await fetchService.useDefaultUrl({
    url: "api/crear_rol",
    method: HttpMethod.POST,
    body: roleData,
    useToken: true,
  }).catch(error => {
    console.error("Error al crear el rol:", error);
    throw new Error('Error al crear el rol');
  });
}

export async function updateRole(id, updatedData) {
  return await fetchService.useDefaultUrl({
    url: `api/actualizar_rol/${id}`,
    method: HttpMethod.PUT,
    body: updatedData,
    useToken: true,
  }).catch(error => {
    console.error("Error al actualizar el rol:", error);
    throw new Error('Error al actualizar el rol');
  });
}

export async function deleteRole(id) {
  return await fetchService.useDefaultUrl({
    url: `api/eliminar_rol/${id}`,
    method: HttpMethod.DELETE,
    useToken: true,
  }).catch(error => {
    console.error("Error al eliminar el rol:", error);
    throw new Error('Error al eliminar el rol');
  });
}