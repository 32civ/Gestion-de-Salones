const BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7138';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res) => {
  const text = await res.text(); // ✅ leer siempre como texto primero

  let data;
  try {
    data = JSON.parse(text); // intentar cambiar como JSON
  } catch {
    data = text; // si falla, usar el texto directamente
  }

  if (!res.ok) {
    const mensaje =
      typeof data === 'string'
        ? data
        : data.message || data.title || data.detail
        || (data.errors ? Object.values(data.errors).flat().join(', ') : null)
        || 'Ocurrió un error inesperado';
    throw new Error(mensaje);
  }

  return data;
};

export const getRecursos = async () => {
  const res = await fetch(`${BASE_URL}/api/Recursos`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

export const getRecurso = async (id) => {
  const res = await fetch(`${BASE_URL}/api/Recursos/${id}`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

export const crearRecurso = async ({ nombre }) => {
  const res = await fetch(`${BASE_URL}/api/Recursos`, {
    method: 'POST', headers: getAuthHeaders(),
    body: JSON.stringify({ nombre }),
  });
  return handleResponse(res);
};

export const editarRecurso = async (id, { nombre }) => {
  const res = await fetch(`${BASE_URL}/api/Recursos/${id}`, {
    method: 'PUT', headers: getAuthHeaders(),
    body: JSON.stringify({ id, nombre }),
  });
  return handleResponse(res);
};

export const eliminarRecurso = async (id) => {
  const res = await fetch(`${BASE_URL}/api/Recursos/${id}`, {
    method: 'DELETE', headers: getAuthHeaders(),
  });
  return handleResponse(res);
};