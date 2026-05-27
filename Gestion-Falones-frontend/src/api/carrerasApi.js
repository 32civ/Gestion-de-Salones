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

// ── Carreras ───────────────────────────────────────────────────────────────

export const getCarreras = async () => {
  const res = await fetch(`${BASE_URL}/api/Carreras`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

export const getCarrera = async (id) => {
  const res = await fetch(`${BASE_URL}/api/Carreras/${id}`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

export const crearCarrera = async (nombre) => {
  const res = await fetch(`${BASE_URL}/api/Carreras`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ nombre }),
  });
  return handleResponse(res);
};

export const editarCarrera = async (id, nombre) => {
  const res = await fetch(`${BASE_URL}/api/Carreras/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ id, nombre }),
  });
  return handleResponse(res);
};

export const eliminarCarrera = async (id) => {
  const res = await fetch(`${BASE_URL}/api/Carreras/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// ── Materias ───────────────────────────────────────────────────────────────

export const getMaterias = async () => {
  const res = await fetch(`${BASE_URL}/api/Materias`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

export const getMateriasPorCarrera = async (carreraId) => {
  const res = await fetch(`${BASE_URL}/api/Materias/carrera/${carreraId}`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

export const crearMateria = async ({ nombre, carreraId }) => {
  const res = await fetch(`${BASE_URL}/api/Materias`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ nombre, carreraId }),
  });
  return handleResponse(res);
};

export const editarMateria = async (id, { nombre, carreraId }) => {
  const res = await fetch(`${BASE_URL}/api/Materias/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ id, nombre, carreraId }),
  });
  return handleResponse(res);
};

export const eliminarMateria = async (id) => {
  const res = await fetch(`${BASE_URL}/api/Materias/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// ── Cursos ─────────────────────────────────────────────────────────────────

export const getCursos = async () => {
  const res = await fetch(`${BASE_URL}/api/Cursos`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

export const crearCurso = async ({ materiaId, docenteId, cupoMaximo }) => {
  const res = await fetch(`${BASE_URL}/api/Cursos`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ materiaId, docenteId, cupoMaximo }),
  });
  return handleResponse(res);
};

export const editarCurso = async (id, { materiaId, docenteId, cupoMaximo }) => {
  const res = await fetch(`${BASE_URL}/api/Cursos/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ materiaId, docenteId, cupoMaximo }),
  });
  return handleResponse(res);
};

export const eliminarCurso = async (id) => {
  const res = await fetch(`${BASE_URL}/api/Cursos/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// ── Docentes (para selector en cursos) ────────────────────────────────────

export const getDocentes = async () => {
  const res = await fetch(`${BASE_URL}/api/Docentes`, { headers: getAuthHeaders() });
  return handleResponse(res);
};