const API_URL = process.env.API_URL;

export async function getAllUsers() {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error('Error al obtener los usuarios');
  }
  return await response.json();
}

export async function getUserById(id) {
  const response = await fetch(`${API_URL}/${id}`);
  if (!response.ok) {
    throw new Error('Usuario no encontrado');
  }
  return await response.json();
}

export async function createUser(userData) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error('Error al crear el usuario');
  }

  return await response.json();
}

export async function updateUser(id, updatedData) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT', 
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedData),
  });

  if (!response.ok) {
    throw new Error('Error al actualizar el usuario');
  }

  return await response.json();
}

export async function deleteUser(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Error al eliminar el usuario');
  }

  return true;
}
