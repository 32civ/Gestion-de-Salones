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

export const getMiPerfil = async () => {
  const res = await fetch(`${BASE_URL}/api/Estudiantes/mi-perfil`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
};

export const asignarCarrera = async (estudianteId, carreraId) => {
  const res = await fetch(`${BASE_URL}/api/Estudiantes/${estudianteId}/carrera`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(carreraId)
  });
  return handleResponse(res);
};