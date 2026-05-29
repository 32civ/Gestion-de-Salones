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

export const getMisCursos = async () => {
  const res = await fetch(`${BASE_URL}/api/Cursos/mis-cursos`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

export const getSalonDelCurso = async (id) => {
  const res = await fetch(`${BASE_URL}/api/Cursos/${id}/salon`, { headers: getAuthHeaders() });
  return handleResponse(res);
};