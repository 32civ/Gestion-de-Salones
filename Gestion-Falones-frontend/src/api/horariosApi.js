const BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7138';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const getHorarios = async () => {
  const res = await fetch(`${BASE_URL}/api/Horarios`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Error al obtener Horarios');
  return res.json();
};

export const getHorario = async (id) => {
  const res = await fetch(`${BASE_URL}/api/Horarios/${id}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Horario no encontrado');
  return res.json();
};

export const crearHorario = async ({ diaSemana, horaInicio, horaFin }) => {
  const res = await fetch(`${BASE_URL}/api/Horarios`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ diaSemana, horaInicio, horaFin }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(typeof data === 'string' ? data : JSON.stringify(data));
  return data;
};

export const editarHorario = async (id, { diaSemana, horaInicio, horaFin }) => {
  const res = await fetch(`${BASE_URL}/api/Horarios/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ id, diaSemana, horaInicio, horaFin }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(typeof data === 'string' ? data : JSON.stringify(data));
  return data;
};

export const eliminarHorario = async (id) => {
  const res = await fetch(`${BASE_URL}/api/Horarios/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(typeof data === 'string' ? data : JSON.stringify(data));
  return data;
};