import { fetchService, HttpMethod } from './fetchUtils';

export async function getAllUsers() {
  return await fetchService.useDefaultUrl({
    url: "api/usuarios",
    method: HttpMethod.GET,
  }).then(response => {
    console.log("Usuarios obtenidos:", response);
    return response;
  }).catch(error => {
    console.error("Error al obtener los usuarios:", error);
    throw new Error('Error al obtener los usuarios');
  });
}

export async function getUserById(id) {
  return await fetchService.useDefaultUrl({
    url: `api/usuarios/${id}`,
    method: HttpMethod.GET,
  }).catch(error => {
    console.error("Error al obtener usuario por ID:", error);
    throw new Error('Usuario no encontrado');
  });
}

export async function createUser(userData) {
  return await fetchService.useDefaultUrl({
    url: "api/crear_usuario",
    method: HttpMethod.POST,
    body: userData,
    useToken: true,
  }).catch(error => {
    console.error("Error al crear el usuario:", error);
    throw new Error('Error al crear el usuario');
  });
}

export async function updateUser(id, updatedData) {
  return await fetchService.useDefaultUrl({
    url: `api/actualizar_usuario/${id}`,
    method: HttpMethod.PUT,
    body: updatedData,
    useToken: true,
  }).catch(error => {
    console.error("Error al actualizar el usuario:", error);
    throw new Error('Error al actualizar el usuario');
  });
}

export async function deleteUser(id) {
  return await fetchService.useDefaultUrl({
    url: `api/eliminar_usuario/${id}`,
    method: HttpMethod.DELETE,
    useToken: true,
  }).catch(error => {
    console.error("Error al eliminar el usuario:", error);
    throw new Error('Error al eliminar el usuario');
  });
}