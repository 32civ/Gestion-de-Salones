const BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7138';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(typeof data === 'string' ? data : data.message || JSON.stringify(data));
  return data;
};

export const getMisAsignaciones = async () => {
  const res = await fetch(`${BASE_URL}/api/Aprobaciones/mis-asignaciones`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
};

export const aceptarAsignacion = async (id) => {
  const res = await fetch(`${BASE_URL}/api/Aprobaciones/${id}/aceptar`, {
    method: 'PUT',
    headers: getAuthHeaders()
  });
  return handleResponse(res);
};

export const rechazarAsignacion = async (id, comentario) => {
  const res = await fetch(`${BASE_URL}/api/Aprobaciones/${id}/rechazar?comentario=${encodeURIComponent(comentario)}`, {
    method: 'PUT',
    headers: getAuthHeaders()
  });
  return handleResponse(res);
};

export const calificarSalon = async (id, comentario) => {
  const res = await fetch(`${BASE_URL}/api/Aprobaciones/${id}/calificar?comentario=${encodeURIComponent(comentario)}`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  return handleResponse(res);
};