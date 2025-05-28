
const API_URL = "http://localhost:5000"; 

async function request(endpoint, method = "GET", body = null, token = null) {
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = { method, headers };
  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Error en la petición");
  }
  return data;
}

const api = {
  register: (nombre, email, password) =>
    request("/registro", "POST", { nombre_usuario: nombre, email_usuario: email, password }),
  login: (email, password) =>
    request("/login", "POST", { email_usuario: email, password }),
};

export default api;
