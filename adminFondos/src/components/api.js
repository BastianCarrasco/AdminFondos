// src/api.js
const API_URL = 'https://backendrw-production.up.railway.app/postulaciones';

export async function fetchPostulaciones() {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Error al obtener las postulaciones');
    return await res.json();
}

export async function deletePostulacion(id) {
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
    });
    if (!res.ok) throw new Error('Error al eliminar la postulación');
    return true;
}
