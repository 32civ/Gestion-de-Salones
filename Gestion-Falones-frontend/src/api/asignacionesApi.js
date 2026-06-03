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

// ── Asignaciones ───────────────────────────────────────────────────────────

export const getAsignaciones = async () => {
  const res = await fetch(`${BASE_URL}/api/Asignaciones`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

export const getAsignacion = async (id) => {
  const res = await fetch(`${BASE_URL}/api/Asignaciones/${id}`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

export const getConflictos = async () => {
  const res = await fetch(`${BASE_URL}/api/Asignaciones/conflictos`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

export const asignacionAutomatica = async ({ cursoId, horarioId, recursosRequeridos = [] }) => {
  const res = await fetch(`${BASE_URL}/api/Asignaciones/automatica`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ cursoId, horarioId, recursosRequeridos }),
  });
  return handleResponse(res);
};

export const asignacionManual = async ({ cursoId, salonId, horarioId }) => {
  const res = await fetch(`${BASE_URL}/api/Asignaciones/manual`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ cursoId, salonId, horarioId }),
  });
  return handleResponse(res);
};

export const cancelarAsignacion = async (id) => {
  const res = await fetch(`${BASE_URL}/api/Asignaciones/${id}/cancelar`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// ── Cursos (para selectores) ───────────────────────────────────────────────

export const getCursos = async () => {
  const res = await fetch(`${BASE_URL}/api/Cursos`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

// ── Salones (para asignación manual) ──────────────────────────────────────

export const getSalones = async () => {
  const res = await fetch(`${BASE_URL}/api/Salones`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

// ── Horarios (para selectores) ─────────────────────────────────────────────

export const getHorarios = async () => {
  const res = await fetch(`${BASE_URL}/api/Horarios`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

// ── Recursos (para asignación automática) ─────────────────────────────────

export const getRecursos = async () => {
  const res = await fetch(`${BASE_URL}/api/Recursos`, { headers: getAuthHeaders() });
  return handleResponse(res);
};