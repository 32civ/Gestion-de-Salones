import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// ─── Paleta ────────────────────────────────────────────────────────────────
const C = {
  naranja: '#E8611A', naranjaOsc: '#C4511A', naranjaClaro: '#FFF0E6',
  blanco: '#FFFFFF', gris50: '#FAFAF9', gris100: '#F5F4F2',
  gris200: '#E8E6E1', gris400: '#B0ADA6', gris600: '#6B6860',
  gris900: '#1C1917', verde: '#16A34A', verdeClaro: '#DCFCE7',
  rojo: '#DC2626', rojoClaro: '#FEE2E2', azul: '#2563EB', azulClaro: '#DBEAFE',
  amarillo: '#D97706', amarilloClaro: '#FEF3C7',
  morado: '#7C3AED', moradoClaro: '#EDE9FE',
};
const sombra = '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05)';
const sombraMedia = '0 4px 12px rgba(0,0,0,0.09), 0 2px 4px rgba(0,0,0,0.06)';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7138';
const authHeaders = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
};

// ─── Fetch helpers ─────────────────────────────────────────────────────────
const fetchAprobaciones = async () => {
  const res = await fetch(`${BASE_URL}/api/Aprobaciones`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error al cargar aprobaciones');
  return data;
};
const fetchAsignaciones = async () => {
  const res = await fetch(`${BASE_URL}/api/Asignaciones`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error al cargar asignaciones');
  return data;
};

// ─── Sidebar (igual al resto del proyecto) ────────────────────────────────
function Sidebar({ onCerrarSesion }) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard',
      icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
    { label: 'Usuarios', path: '/usuarios',
      icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg> },
    { label: 'Recursos', path: '/recursos',
      icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg> },
    { label: 'Reportes', path: '/reportes',
      icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg> },
  ];

  return (
    <div style={{ width: 220, background: C.blanco, borderRight: `1px solid ${C.gris200}`, display: 'flex', flexDirection: 'column', padding: '1.5rem 0', flexShrink: 0 }}>
      <div style={{ padding: '0 1.25rem 1.5rem', borderBottom: `1px solid ${C.gris200}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: C.naranja, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5V19a1 1 0 001 1h6v-5h4v5h6a1 1 0 001-1v-8.5M9 21V12h6v9M3 10.5L12 3l9 7.5"/>
            </svg>
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.gris900, margin: 0, fontFamily: '"DM Sans", sans-serif' }}>Gestión Salones</p>
            <p style={{ fontSize: 11, color: C.gris400, margin: 0, fontFamily: '"DM Sans", sans-serif' }}>Personal Administrativo</p>
          </div>
        </div>
      </div>
      <nav style={{ padding: '1rem 0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {navItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <a key={item.path} onClick={() => navigate(item.path)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
              background: active ? C.naranjaClaro : 'transparent', borderRadius: 8,
              fontSize: 13, color: active ? C.naranja : C.gris600,
              fontWeight: active ? 600 : 400, cursor: 'pointer',
              fontFamily: '"DM Sans", sans-serif',
            }}>{item.icon}{item.label}</a>
          );
        })}
      </nav>
      <div style={{ padding: '0.75rem', borderTop: `1px solid ${C.gris200}` }}>
        <a onClick={onCerrarSesion} style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
          borderRadius: 8, fontSize: 13, color: C.rojo, cursor: 'pointer',
          fontFamily: '"DM Sans", sans-serif',
        }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          Cerrar sesión
        </a>
      </div>
    </div>
  );
}

// ─── Mini barra horizontal ─────────────────────────────────────────────────
function BarraHorizontal({ valor, max, color }) {
  const pct = max > 0 ? Math.round((valor / max) * 100) : 0;
  return (
    <div style={{ flex: 1, height: 8, background: C.gris100, borderRadius: 99, overflow: 'hidden' }}>
      <div style={{
        height: '100%', width: `${pct}%`, background: color,
        borderRadius: 99, transition: 'width 0.6s ease',
      }}/>
    </div>
  );
}

// ─── Tarjeta métrica ───────────────────────────────────────────────────────
function MetricCard({ icono, label, valor, sub, color, bg }) {
  return (
    <div style={{
      background: C.blanco, border: `1.5px solid ${C.gris200}`,
      borderRadius: 12, padding: '1.25rem', boxShadow: sombra,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <p style={{ fontSize: 12, color: C.gris400, margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: '"DM Sans", sans-serif' }}>{label}</p>
        <div style={{ width: 34, height: 34, background: bg, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>{icono}</div>
      </div>
      <p style={{ fontSize: 30, fontWeight: 800, color: C.gris900, margin: '0 0 4px', fontFamily: '"DM Sans", sans-serif', lineHeight: 1 }}>{valor}</p>
      <p style={{ fontSize: 12, color: C.gris400, margin: 0, fontFamily: '"DM Sans", sans-serif' }}>{sub}</p>
    </div>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────
function Skeleton({ h = 160 }) {
  return (
    <div style={{ background: C.blanco, border: `1.5px solid ${C.gris200}`, borderRadius: 12, height: h, animation: 'pulse 1.4s ease-in-out infinite' }}/>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════
export default function Reportes() {
  const navigate = useNavigate();

  const [aprobaciones, setAprobaciones] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [cargando,     setCargando]     = useState(true);
  const [error,        setError]        = useState(null);
  const [busqueda,     setBusqueda]     = useState('');

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/');
  };

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const [ap, as] = await Promise.allSettled([
        fetchAprobaciones(), fetchAsignaciones(), 
      ]);
      if (ap.status === 'fulfilled') setAprobaciones(ap.value);
      if (as.status === 'fulfilled') setAsignaciones(as.value);
      if (ap.status === 'rejected') throw new Error(ap.reason.message);
    } catch (e) {
      setError(e.message);
    } finally { setCargando(false); }
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  // ── Derivar métricas ──────────────────────────────────────────────────
  const totalAsignaciones = asignaciones.length;
  const aprobadas  = asignaciones.filter(a => a.estado === 'Aprobado').length;
  const rechazadas = asignaciones.filter(a => a.estado === 'Rechazado').length;
  const pendientes = asignaciones.filter(a => a.estado === 'Pendiente').length;

  // Calificaciones: aprobaciones con aprobado=true y comentario distinto de "Aprobado"
  const calificaciones = aprobaciones.filter(ap => ap.aprobado && ap.comentario && ap.comentario !== 'Aprobado');

  // Rechazos por docente
  const rechazosPorDocente = aprobaciones
    .filter(ap => !ap.aprobado)
    .reduce((acc, ap) => {
      const nombre = ap.docente || 'Desconocido';
      acc[nombre] = (acc[nombre] || 0) + 1;
      return acc;
    }, {});

  const rankingRechazos = Object.entries(rechazosPorDocente)
    .map(([docente, total]) => ({ docente, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  const maxRechazos = rankingRechazos[0]?.total || 1;

  // Cursos por docente

    const cursosPorDocente = asignaciones
    .filter(a => a.estado === 'Aprobado')
    .reduce((acc, a) => {
        const nombre = a.docente || 'Desconocido';
        acc[nombre] = (acc[nombre] || 0) + 1;
        return acc;
    }, {});

    const rankingCursos = Object.entries(cursosPorDocente)
    .map(([docente, total]) => ({ docente, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  const maxCursos = rankingCursos[0]?.total || 1;

  // Calificaciones filtradas por búsqueda
  const calificacionesFiltradas = calificaciones.filter(ap =>
    !busqueda ||
    ap.docente?.toLowerCase().includes(busqueda.toLowerCase()) ||
    ap.curso?.toLowerCase().includes(busqueda.toLowerCase()) ||
    ap.salon?.toLowerCase().includes(busqueda.toLowerCase()) ||
    ap.comentario?.toLowerCase().includes(busqueda.toLowerCase())
  );

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: ${C.gris200}; border-radius: 99px; }
      `}</style>

      <div style={{ minHeight: '100vh', background: C.gris100, display: 'flex', fontFamily: '"DM Sans", sans-serif' }}>

        <Sidebar onCerrarSesion={cerrarSesion} />

        <div style={{ flex: 1, padding: '2rem', overflow: 'auto' }}>

          {/* ── Encabezado ── */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: C.naranja, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📊</div>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: C.gris900 }}>Reportes</h1>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: C.gris400, paddingLeft: 50 }}>
              Calificaciones docentes · Asignaciones · Actividad académica
            </p>
          </div>

          {error && (
            <div style={{
              background: C.rojoClaro, border: `1.5px solid ${C.rojo}30`,
              borderRadius: 10, padding: '12px 16px', marginBottom: 20,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span>⚠️</span>
              <p style={{ margin: 0, fontSize: 13, color: C.rojo, fontFamily: '"DM Sans", sans-serif' }}>{error}</p>
              <button onClick={cargarDatos} style={{ marginLeft: 'auto', padding: '5px 12px', background: C.rojo, color: C.blanco, border: 'none', borderRadius: 7, fontSize: 12, cursor: 'pointer' }}>Reintentar</button>
            </div>
          )}

          {cargando ? (
            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                {[...Array(4)].map((_, i) => <Skeleton key={i} h={110} />)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[...Array(2)].map((_, i) => <Skeleton key={i} h={300} />)}
              </div>
              <Skeleton h={350} />
            </div>
          ) : (
            <>
              {/* ── Métricas generales ── */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
                <MetricCard icono="📋" label="Total asignaciones" valor={totalAsignaciones} sub="Registradas en el sistema" color={C.naranja} bg={C.naranjaClaro} />
                <MetricCard icono="✅" label="Aprobadas" valor={aprobadas} sub="Por docentes" color={C.verde} bg={C.verdeClaro} />
                <MetricCard icono="❌" label="Rechazadas" valor={rechazadas} sub="Con comentario de motivo" color={C.rojo} bg={C.rojoClaro} />
                <MetricCard icono="⭐" label="Calificaciones" valor={calificaciones.length} sub="Comentarios de salones" color={C.amarillo} bg={C.amarilloClaro} />
              </div>

              {/* ── Rankings ── */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>

                {/* Docentes con más rechazos */}
                <div style={{ background: C.blanco, border: `1.5px solid ${C.gris200}`, borderRadius: 12, padding: '1.25rem', boxShadow: sombra }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <span style={{ fontSize: 18 }}>❌</span>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.gris900 }}>Docentes con más rechazos</h3>
                      <p style={{ margin: 0, fontSize: 11, color: C.gris400 }}>Asignaciones rechazadas por docente</p>
                    </div>
                  </div>
                  {rankingRechazos.length === 0 ? (
                    <p style={{ fontSize: 13, color: C.gris400, textAlign: 'center', padding: '2rem 0' }}>Sin rechazos registrados 🎉</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {rankingRechazos.map((item, i) => (
                        <div key={item.docente} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{
                            width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                            background: i === 0 ? C.rojoClaro : C.gris100,
                            color: i === 0 ? C.rojo : C.gris600,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 10, fontWeight: 800,
                          }}>{i + 1}</span>
                          <span style={{ fontSize: 13, color: C.gris900, fontWeight: 600, width: 130, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.docente}</span>
                          <BarraHorizontal valor={item.total} max={maxRechazos} color={C.rojo} />
                          <span style={{ fontSize: 12, fontWeight: 700, color: C.rojo, flexShrink: 0, minWidth: 20, textAlign: 'right' }}>{item.total}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Docentes con más cursos */}
                <div style={{ background: C.blanco, border: `1.5px solid ${C.gris200}`, borderRadius: 12, padding: '1.25rem', boxShadow: sombra }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <span style={{ fontSize: 18 }}>📚</span>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.gris900 }}>Docentes con más cursos</h3>
                      <p style={{ margin: 0, fontSize: 11, color: C.gris400 }}>Carga académica por docente</p>
                    </div>
                  </div>
                  {rankingCursos.length === 0 ? (
                    <p style={{ fontSize: 13, color: C.gris400, textAlign: 'center', padding: '2rem 0' }}>Sin cursos registrados</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {rankingCursos.map((item, i) => (
                        <div key={item.docente} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{
                            width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                            background: i === 0 ? C.naranjaClaro : C.gris100,
                            color: i === 0 ? C.naranja : C.gris600,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 10, fontWeight: 800,
                          }}>{i + 1}</span>
                          <span style={{ fontSize: 13, color: C.gris900, fontWeight: 600, width: 130, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.docente}</span>
                          <BarraHorizontal valor={item.total} max={maxCursos} color={C.naranja} />
                          <span style={{ fontSize: 12, fontWeight: 700, color: C.naranja, flexShrink: 0, minWidth: 20, textAlign: 'right' }}>{item.total}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Calificaciones de salones ── */}
              <div style={{ background: C.blanco, border: `1.5px solid ${C.gris200}`, borderRadius: 12, padding: '1.25rem', boxShadow: sombra }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>⭐</span>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.gris900 }}>Calificaciones de salones</h3>
                      <p style={{ margin: 0, fontSize: 11, color: C.gris400 }}>Comentarios enviados por docentes</p>
                    </div>
                  </div>
                  {/* Búsqueda */}
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.gris400, fontSize: 13 }}>🔍</span>
                    <input
                      type="text" placeholder="Buscar…" value={busqueda}
                      onChange={e => setBusqueda(e.target.value)}
                      style={{
                        padding: '7px 12px 7px 30px', borderRadius: 8,
                        border: `1.5px solid ${C.gris200}`, fontSize: 13,
                        fontFamily: '"DM Sans", sans-serif', color: C.gris900,
                        background: C.gris50, outline: 'none', width: 200,
                      }}
                      onFocus={e => { e.target.style.borderColor = C.naranja; }}
                      onBlur={e => { e.target.style.borderColor = C.gris200; }}
                    />
                  </div>
                </div>

                {calificacionesFiltradas.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                    <p style={{ fontSize: 32, margin: '0 0 8px' }}>⭐</p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: C.gris900, margin: 0 }}>
                      {busqueda ? 'Sin resultados' : 'No hay calificaciones aún'}
                    </p>
                    <p style={{ fontSize: 13, color: C.gris400, margin: '4px 0 0' }}>
                      {busqueda ? 'Prueba con otro término.' : 'Los docentes aún no han calificado sus salones.'}
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                    {calificacionesFiltradas.map(ap => (
                      <div key={ap.id} style={{
                        border: `1.5px solid ${C.amarillo}25`, background: C.amarilloClaro,
                        borderRadius: 10, padding: '14px 16px',
                        boxShadow: sombra, transition: 'box-shadow 0.15s',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = sombraMedia; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = sombra; }}
                      >
                        {/* Header tarjeta */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                          <div>
                            <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 700, color: C.gris900, fontFamily: '"DM Sans", sans-serif' }}>
                              {ap.salon}
                            </p>
                            <p style={{ margin: 0, fontSize: 11, color: C.gris600, fontFamily: '"DM Sans", sans-serif' }}>
                              📖 {ap.curso}
                            </p>
                          </div>
                          <span style={{ fontSize: 20 }}>⭐</span>
                        </div>
                        {/* Comentario */}
                        <div style={{
                          background: 'rgba(255,255,255,0.65)', borderRadius: 8,
                          padding: '8px 10px', marginBottom: 10,
                        }}>
                          <p style={{ margin: 0, fontSize: 12, color: C.gris900, fontFamily: '"DM Sans", sans-serif', lineHeight: 1.5, fontStyle: 'italic' }}>
                            "{ap.comentario}"
                          </p>
                        </div>
                        {/* Footer */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{
                            width: 26, height: 26, borderRadius: '50%',
                            background: C.naranja, display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontSize: 12, color: C.blanco, fontWeight: 700,
                            flexShrink: 0,
                          }}>
                            {(ap.docente?.[0] ?? '?').toUpperCase()}{/* Posible linea problemátic*/}
                          </div>
                          <p style={{ margin: 0, fontSize: 12, color: C.gris600, fontWeight: 600, fontFamily: '"DM Sans", sans-serif' }}>
                            {ap.docente}
                          </p>
                          <span style={{ marginLeft: 'auto', fontSize: 11, color: C.gris400, fontFamily: '"DM Sans", sans-serif' }}>
                            Día {ap.dia} · {ap.horaInicio} – {ap.horaFin}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}