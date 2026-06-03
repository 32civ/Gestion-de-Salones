const BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7138';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res) => {
  const text = await res.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
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

export const getHorarios = async () => {
  const res = await fetch(`${BASE_URL}/api/Horarios`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

export const getHorario = async (id) => {
  const res = await fetch(`${BASE_URL}/api/Horarios/${id}`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

export const crearHorario = async ({ diaSemana, horaInicio, horaFin }) => {
  const res = await fetch(`${BASE_URL}/api/Horarios`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ diaSemana, horaInicio, horaFin }),
  });
  return handleResponse(res);
};

export const editarHorario = async (id, { diaSemana, horaInicio, horaFin }) => {
  const res = await fetch(`${BASE_URL}/api/Horarios/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ id, diaSemana, horaInicio, horaFin }),
  });
  return handleResponse(res);
};

export const eliminarHorario = async (id) => {
  const res = await fetch(`${BASE_URL}/api/Horarios/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};