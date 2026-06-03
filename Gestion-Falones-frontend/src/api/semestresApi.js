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
    data = JSON.parse(text); // intentar parsear como JSON
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

export const getSemestres = async () => {
  const res = await fetch(`${BASE_URL}/api/Semestres`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

export const getSemestreActivo = async () => {
  const res = await fetch(`${BASE_URL}/api/Semestres/activo`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

export const crearSemestre = async ({ nombre, fechaInicio, fechaFin }) => {
  const res = await fetch(`${BASE_URL}/api/Semestres`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ nombre, fechaInicio, fechaFin }),
  });
  return handleResponse(res);
};

export const editarSemestre = async (id, { nombre, fechaInicio, fechaFin }) => {
  const res = await fetch(`${BASE_URL}/api/Semestres/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ nombre, fechaInicio, fechaFin }),
  });
  return handleResponse(res);
};

export const eliminarSemestre = async (id) => {
  const res = await fetch(`${BASE_URL}/api/Semestres/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};