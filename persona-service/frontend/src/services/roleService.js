import { authHeader } from './authHeader';

const API_URL = process.env.API_URL;

export async function getAllRoles() {
    const response = await fetch(API_URL);
    if (!response.ok) {
        throw new Error('Error al obtener los roles');
    }
    return await response.json();
}

export async function getRoleById(id) {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) {
        throw new Error('Rol no encontrado');
    }
    return await response.json();
}

export async function createRole(roleData) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            headers: authHeader(),
        },
        body: JSON.stringify(roleData),
    });

    if (!response.ok) {
        throw new Error('Error al crear el rol');
    }

    return await response.json();
}

export async function updateRole(id, updatedData) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
            headers: authHeader(),
        },
        body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
        throw new Error('Error al actualizar el rol');
    }

    return await response.json();
}

export async function deleteRole(id) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
            headers: authHeader(),
        }
    });

    if (!response.ok) {
        throw new Error('Error al eliminar el rol');
    }

    return true;
}
