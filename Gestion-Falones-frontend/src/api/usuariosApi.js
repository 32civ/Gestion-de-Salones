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

export const getUsuarios = async () => {
  const res = await fetch(`${BASE_URL}/api/Usuarios`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

export const getUsuario = async (id) => {
  const res = await fetch(`${BASE_URL}/api/Usuarios/${id}`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

export const crearUsuario = async (dto) => {
  const res = await fetch(`${BASE_URL}/api/Usuarios`, {
    method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(dto),
  });
  return handleResponse(res);
};

export const editarUsuario = async (id, dto) => {
  const res = await fetch(`${BASE_URL}/api/Usuarios/${id}`, {
    method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(dto),
  });
  return handleResponse(res);
};

export const cambiarPassword = async (id, nuevaPassword) => {
  const res = await fetch(`${BASE_URL}/api/Usuarios/${id}/password`, {
    method: 'PUT', headers: getAuthHeaders(),
    body: JSON.stringify({ nuevaPassword }),
  });
  return handleResponse(res);
};

export const activarUsuario = async (id) => {
  const res = await fetch(`${BASE_URL}/api/Usuarios/${id}/activar`, {
    method: 'PUT', headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const desactivarUsuario = async (id) => {
  const res = await fetch(`${BASE_URL}/api/Usuarios/${id}/desactivar`, {
    method: 'PUT', headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const eliminarUsuario = async (id) => {
  const res = await fetch(`${BASE_URL}/api/Usuarios/${id}`, {
    method: 'DELETE', headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const getCarreras = async () => {
  const res = await fetch(`${BASE_URL}/api/Carreras`, { headers: getAuthHeaders() });
  return handleResponse(res);
};