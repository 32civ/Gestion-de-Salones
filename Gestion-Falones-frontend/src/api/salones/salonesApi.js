const BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7138';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ── Salones ────────────────────────────────────────────────────────────────

export const getSalones = async () => {
  const res = await fetch(`${BASE_URL}/api/Salones`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Error al obtener Salones');
  return res.json();
};

export const getSalon = async (id) => {
  const res = await fetch(`${BASE_URL}/api/Salones/${id}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Salón no encontrado');
  return res.json();
};

export const crearSalon = async ({ nombre, capacidad }) => {
  const res = await fetch(`${BASE_URL}/api/Salones`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ nombre, capacidad }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(typeof data === 'string' ? data : JSON.stringify(data));
  return data;
};

export const editarSalon = async (id, { nombre, capacidad }) => {
  const res = await fetch(`${BASE_URL}/api/Salones/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ id, nombre, capacidad }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(typeof data === 'string' ? data : JSON.stringify(data));
  return data;
};

export const eliminarSalon = async (id) => {
  const res = await fetch(`${BASE_URL}/api/Salones/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(typeof data === 'string' ? data : JSON.stringify(data));
  return data;
};

// ── Recursos de un salón ───────────────────────────────────────────────────

export const agregarRecursoASalon = async (salonId, recursoId) => {
  const res = await fetch(
    `${BASE_URL}/api/Salones/${salonId}/recursos?recursoId=${recursoId}`,
    { method: 'POST', headers: getAuthHeaders() }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(typeof data === 'string' ? data : JSON.stringify(data));
  return data;
};

export const quitarRecursoDeSalon = async (salonId, recursoId) => {
  const res = await fetch(
    `${BASE_URL}/api/Salones/${salonId}/recursos/${recursoId}`,
    { method: 'DELETE', headers: getAuthHeaders() }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(typeof data === 'string' ? data : JSON.stringify(data));
  return data;
};

// ── Recursos globales (catálogo) ───────────────────────────────────────────

export const getRecursos = async () => {
  const res = await fetch(`${BASE_URL}/api/recursos`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Error al obtener recursos');
  return res.json();
};