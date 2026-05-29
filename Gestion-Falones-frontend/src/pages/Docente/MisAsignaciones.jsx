import { useState, useEffect, Fragment } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getMisAsignaciones, aceptarAsignacion, rechazarAsignacion, calificarSalon } from "../../api/aprobacionesApi";

// ─── Paleta (consistente con el resto del proyecto) ────────────────────────
const C = {
  naranja: '#E8611A', naranjaOsc: '#C4511A', naranjaClaro: '#FFF0E6',
  blanco: '#FFFFFF', gris50: '#FAFAF9', gris100: '#F5F4F2',
  gris200: '#E8E6E1', gris400: '#B0ADA6', gris600: '#6B6860',
  gris900: '#1C1917', verde: '#16A34A', verdeClaro: '#DCFCE7',
  rojo: '#DC2626', rojoClaro: '#FEE2E2', azul: '#2563EB', azulClaro: '#DBEAFE',
  amarillo: '#D97706', amarilloClaro: '#FEF3C7',
};
const sombra = '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05)';
const sombraGrande = '0 12px 30px rgba(0,0,0,0.13), 0 4px 10px rgba(0,0,0,0.08)';

// ─── Modal de comentario (rechazar / calificar) ────────────────────────────
function ModalComentario({ titulo, subtitulo, placeholder, confirmLabel, confirmColor, icono, onConfirm, onCancel }) {
  const [texto, setTexto] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!texto.trim()) { setError('Este campo es obligatorio'); return; }
    onConfirm(texto.trim());
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(28,25,23,0.45)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }} onClick={onCancel}>
      <div style={{
        background: C.blanco, borderRadius: 16, width: '100%', maxWidth: 440,
        boxShadow: sombraGrande, animation: 'popIn 0.18s ease',
        overflow: 'hidden',
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: `1px solid ${C.gris200}`,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>{icono}</span>
            <div>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: C.gris900, fontFamily: '"DM Sans", sans-serif' }}>{titulo}</p>
              {subtitulo && <p style={{ margin: '2px 0 0', fontSize: 12, color: C.gris400, fontFamily: '"DM Sans", sans-serif' }}>{subtitulo}</p>}
            </div>
          </div>
          <button onClick={onCancel} style={{
            background: C.gris100, border: 'none', borderRadius: 8,
            width: 28, height: 28, cursor: 'pointer', fontSize: 14,
            color: C.gris600, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px' }}>
          <textarea
            autoFocus
            rows={3}
            placeholder={placeholder}
            value={texto}
            onChange={e => { setTexto(e.target.value); setError(''); }}
            style={{
              width: '100%', padding: '10px 13px', borderRadius: 8,
              border: `1.5px solid ${error ? C.rojo : C.gris200}`,
              fontSize: 14, fontFamily: '"DM Sans", sans-serif',
              color: C.gris900, resize: 'none', outline: 'none',
              background: error ? C.rojoClaro : C.blanco,
              boxSizing: 'border-box', lineHeight: 1.5,
              transition: 'border-color 0.14s',
            }}
            onFocus={e => { if (!error) e.target.style.borderColor = C.naranja; }}
            onBlur={e => { if (!error) e.target.style.borderColor = C.gris200; }}
            onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleConfirm(); }}
          />
          {error && <p style={{ margin: '4px 0 0', fontSize: 11, color: C.rojo, fontFamily: '"DM Sans", sans-serif' }}>{error}</p>}
          <p style={{ margin: '6px 0 0', fontSize: 11, color: C.gris400, fontFamily: '"DM Sans", sans-serif' }}>
            Ctrl + Enter para confirmar
          </p>

          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button onClick={onCancel} style={{
              flex: 1, padding: '9px 0', borderRadius: 8,
              border: `1.5px solid ${C.gris200}`, background: C.blanco,
              color: C.gris600, fontSize: 13, fontWeight: 700,
              fontFamily: '"DM Sans", sans-serif', cursor: 'pointer',
            }}>Cancelar</button>
            <button onClick={handleConfirm} style={{
              flex: 1, padding: '9px 0', borderRadius: 8,
              border: 'none', background: confirmColor,
              color: C.blanco, fontSize: 13, fontWeight: 700,
              fontFamily: '"DM Sans", sans-serif', cursor: 'pointer',
            }}>{confirmLabel}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Badge de estado ───────────────────────────────────────────────────────
function BadgeEstado({ estado }) {
  const map = {
    Pendiente: { bg: C.amarilloClaro, color: C.amarillo },
    Aprobado:  { bg: C.verdeClaro,    color: C.verde    },
    Rechazado: { bg: C.rojoClaro,     color: C.rojo     },
    Cancelada: { bg: C.gris200,       color: C.gris600  },
  };
  const s = map[estado] ?? { bg: C.gris200, color: C.gris600 };
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 700, background: s.bg, color: s.color,
      fontFamily: '"DM Sans", sans-serif',
    }}>{estado ?? '—'}</span>
  );
}

// ─── Sidebar ───────────────────────────────────────────────────────────────
function Sidebar({ onCerrarSesion }) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard',
      icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
    { label: 'Mis cursos', path: '/mis-cursos',
      icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg> },
    { label: 'Mis asignaciones', path: '/mis-asignaciones',
      icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
  ];

  return (
    <div style={{ width: 220, background: C.blanco, borderRight: `1px solid ${C.gris200}`, display: 'flex', flexDirection: 'column', padding: '1.5rem 0', flexShrink: 0 }}>
      <div style={{ padding: '0 1.25rem 1.5rem', borderBottom: `1px solid ${C.gris200}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: C.naranja, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5V19a1 1 0 001 1h6v-5h4v5h6a1 1 0 001-1v-8.5M9 21V12h6v9M3 10.5L12 3l9 7.5" />
            </svg>
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.gris900, margin: 0, fontFamily: '"DM Sans", sans-serif' }}>Gestión Salones</p>
            <p style={{ fontSize: 11, color: C.gris400, margin: 0, fontFamily: '"DM Sans", sans-serif' }}>Docente</p>
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Cerrar sesión
        </a>
      </div>
    </div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────
function MisAsignaciones() {
  const navigate = useNavigate();

  const [asignaciones, setAsignaciones] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  // Modal state: { tipo: 'rechazar'|'calificar', id, materia }
  const [modal, setModal] = useState(null);

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMisAsignaciones();
      setAsignaciones(data);
    } catch (err) {
      setError(err.message || 'Error al cargar las asignaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleAceptar = async (id) => {
    try {
      await aceptarAsignacion(id);
      cargarDatos();
    } catch (err) { alert(err.message); }
  };

  const handleRechazar = async (comentario) => {
    try {
      await rechazarAsignacion(modal.id, comentario);
      setModal(null);
      cargarDatos();
    } catch (err) { alert(err.message); }
  };

  const handleCalificar = async (comentario) => {
    try {
      await calificarSalon(modal.id, comentario);
      setModal(null);
      cargarDatos();
    } catch (err) { alert(err.message); }
  };

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/');
  };

  // ── Agrupaciones ──
  const pendientes = asignaciones.filter(a => a.estado === 'Pendiente');
  const aprobadas  = asignaciones.filter(a => a.estado === 'Aprobado');
  const rechazadas = asignaciones.filter(a => a.estado === 'Rechazado');

  const metricCards = [
    { label: 'Pendientes', value: pendientes.length, sub: 'Por aceptar o rechazar', bg: C.amarilloClaro, stroke: C.amarillo },
    { label: 'Aprobadas',  value: aprobadas.length,  sub: 'Asignaciones confirmadas', bg: C.verdeClaro,    stroke: C.verde    },
    { label: 'Rechazadas', value: rechazadas.length, sub: 'Asignaciones rechazadas',  bg: C.rojoClaro,     stroke: C.rojo     },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes popIn { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
        * { box-sizing: border-box; }
      `}</style>

      <div style={{ minHeight: '100vh', background: C.gris100, display: 'flex', fontFamily: '"DM Sans", sans-serif' }}>

        <Sidebar onCerrarSesion={cerrarSesion} />

        {/* ── Contenido ── */}
        <div style={{ flex: 1, padding: '2rem', overflow: 'auto' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '2rem' }}>
            <button onClick={() => navigate('/dashboard')} style={{
              background: C.blanco, border: `1px solid ${C.gris200}`, borderRadius: 8,
              padding: '6px 12px', fontSize: 13, color: C.gris600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: '"DM Sans", sans-serif',
            }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
              </svg>
              Volver
            </button>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: C.gris900, margin: '0 0 2px' }}>Mis asignaciones</h1>
              <p style={{ fontSize: 13, color: C.gris400, margin: 0 }}>Gestión de salones asignados</p>
            </div>
          </div>

          {loading && (
            <p style={{ textAlign: 'center', color: C.gris400, fontSize: 13, padding: '4rem 0' }}>Cargando...</p>
          )}

          {error && (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <p style={{ color: C.rojo, fontSize: 13, marginBottom: 8 }}>{error}</p>
              <button onClick={cargarDatos} style={{
                padding: '6px 14px', background: C.naranjaClaro, color: C.naranja,
                border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer',
              }}>Reintentar</button>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Métricas */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {metricCards.map(card => (
                  <div key={card.label} style={{
                    background: C.blanco, border: `1.5px solid ${C.gris200}`,
                    borderRadius: 12, padding: '1.25rem', boxShadow: sombra,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <p style={{ fontSize: 12, color: C.gris400, margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.label}</p>
                      <div style={{ width: 32, height: 32, background: card.bg, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={card.stroke} strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      </div>
                    </div>
                    <p style={{ fontSize: 28, fontWeight: 800, color: C.gris900, margin: '0 0 4px' }}>{card.value}</p>
                    <p style={{ fontSize: 12, color: C.gris400, margin: 0 }}>{card.sub}</p>
                  </div>
                ))}
              </div>

              {/* ── Pendientes ── */}
              {pendientes.length > 0 && (
                <div style={{
                  background: C.blanco, border: `1.5px solid ${C.amarillo}30`,
                  borderRadius: 12, padding: '1.25rem', marginBottom: '1.25rem', boxShadow: sombra,
                }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: C.gris900, margin: '0 0 1rem', fontFamily: '"DM Sans", sans-serif' }}>
                    ⚠️ Pendientes de revisión
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {pendientes.map(a => (
                      <div key={a.id} style={{
                        border: `1px solid ${C.amarillo}25`, background: C.amarilloClaro,
                        borderRadius: 10, padding: '1rem',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
                        flexWrap: 'wrap',
                      }}>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 700, color: C.gris900, margin: '0 0 3px' }}>{a.materia}</p>
                          <p style={{ fontSize: 12, color: C.gris600, margin: '0 0 2px' }}>🏫 {a.salon} · Capacidad: {a.capacidad}</p>
                          <p style={{ fontSize: 12, color: C.gris600, margin: '0 0 2px' }}>🕐 Día {a.dia} {a.horaInicio} - {a.horaFin}</p>
                          {a.recursos?.length > 0 && (
                            <p style={{ fontSize: 12, color: C.gris400, margin: '2px 0 0' }}>🔧 {a.recursos.join(', ')}</p>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                          <button onClick={() => handleAceptar(a.id)} style={{
                            padding: '7px 16px', background: C.verdeClaro, color: C.verde,
                            border: `1px solid ${C.verde}30`, borderRadius: 8,
                            fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: '"DM Sans", sans-serif',
                          }}>✓ Aceptar</button>
                          <button onClick={() => setModal({ tipo: 'rechazar', id: a.id, materia: a.materia })} style={{
                            padding: '7px 16px', background: C.rojoClaro, color: C.rojo,
                            border: `1px solid ${C.rojo}30`, borderRadius: 8,
                            fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: '"DM Sans", sans-serif',
                          }}>✗ Rechazar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Historial ── */}
              <div style={{
                background: C.blanco, border: `1.5px solid ${C.gris200}`,
                borderRadius: 12, padding: '1.25rem', boxShadow: sombra,
              }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: C.gris900, margin: '0 0 1.25rem' }}>
                  📋 Historial de asignaciones
                </h3>
                <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.gris200}` }}>
                      {['Materia', 'Salón', 'Horario', 'Recursos', 'Estado', 'Acciones'].map(col => (
                        <th key={col} style={{
                          textAlign: 'left', padding: '6px 8px 10px',
                          color: C.gris400, fontWeight: 600, fontSize: 11,
                          textTransform: 'uppercase', letterSpacing: '0.05em',
                          fontFamily: '"DM Sans", sans-serif',
                        }}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {asignaciones.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ padding: '2rem 0', textAlign: 'center', color: C.gris400, fontSize: 13 }}>
                          No tienes asignaciones aún
                        </td>
                      </tr>
                    ) : (
                      asignaciones.map(a => (
                        <tr key={a.id} style={{ borderBottom: `1px solid ${C.gris100}` }}>
                          <td style={{ padding: '12px 8px', color: C.gris900, fontWeight: 600 }}>{a.materia}</td>
                          <td style={{ padding: '12px 8px', color: C.gris600 }}>{a.salon}</td>
                          <td style={{ padding: '12px 8px', color: C.gris600 }}>Día {a.dia} {a.horaInicio} - {a.horaFin}</td>
                          <td style={{ padding: '12px 8px', color: C.gris600 }}>{a.recursos?.join(', ') || <span style={{ color: C.gris200 }}>Sin recursos</span>}</td>
                          <td style={{ padding: '12px 8px' }}><BadgeEstado estado={a.estado} /></td>
                          <td style={{ padding: '12px 8px' }}>
                            {a.estado === 'Aprobado' && (
                              <button onClick={() => setModal({ tipo: 'calificar', id: a.id, materia: a.materia })} style={{
                                padding: '5px 12px', background: C.azulClaro, color: C.azul,
                                border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700,
                                cursor: 'pointer', fontFamily: '"DM Sans", sans-serif',
                              }}>★ Calificar</button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Modales ── */}
      {modal?.tipo === 'rechazar' && (
        <ModalComentario
          titulo="Rechazar asignación"
          subtitulo={modal.materia}
          placeholder="Explica el motivo del rechazo…"
          confirmLabel="Confirmar rechazo"
          confirmColor={C.rojo}
          icono="❌"
          onConfirm={handleRechazar}
          onCancel={() => setModal(null)}
        />
      )}
      {modal?.tipo === 'calificar' && (
        <ModalComentario
          titulo="Calificar salón"
          subtitulo={modal.materia}
          placeholder="Escribe tu comentario sobre el salón…"
          confirmLabel="Enviar calificación"
          confirmColor={C.azul}
          icono="★"
          onConfirm={handleCalificar}
          onCancel={() => setModal(null)}
        />
      )}
    </>
  );
}

export default MisAsignaciones;