import { fetchService, HttpMethod } from './fetchUtils';

export async function login(credentials) {
  return await fetchService.useDefaultUrl({
    url: "api/login",
    method: HttpMethod.POST,
    body: credentials,
  }).catch(error => {
    console.error("Error al iniciar sesión:", error);
    throw new Error('Error al iniciar sesión');
  });
}

export async function register(userData) {
  return await fetchService.useDefaultUrl({
    url: "api/register",
    method: HttpMethod.POST,
    body: userData,
  }).catch(error => {
    console.error("Error al registrarse:", error);
    throw new Error('Error al registrarse');
  });
}