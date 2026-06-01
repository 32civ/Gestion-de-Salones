import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecursos, getRecurso, crearRecurso, editarRecurso, eliminarRecurso } from '../../api/recursosApi';

// ─── Diseño ────────────────────────────────────────────────────────────────
const C = {
  naranja:       '#E8611A', naranjaOsc:    '#C4511A', naranjaClaro:  '#FFF0E6',
  blanco:        '#FFFFFF', gris50:        '#FAFAF9', gris100:       '#F5F4F2',
  gris200:       '#E8E6E1', gris400:       '#B0ADA6', gris600:       '#6B6860',
  gris900:       '#1C1917', verde:         '#16A34A', verdeClaro:    '#DCFCE7',
  rojo:          '#DC2626', rojoClaro:     '#FEE2E2', azul:          '#2563EB',
  azulClaro:     '#DBEAFE', amarillo:      '#D97706', amarilloClaro: '#FEF3C7',
};
const sombra       = '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05)';
const sombraMedia  = '0 4px 12px rgba(0,0,0,0.09), 0 2px 4px rgba(0,0,0,0.06)';
const sombraGrande = '0 12px 30px rgba(0,0,0,0.13), 0 4px 10px rgba(0,0,0,0.08)';

// ─── Toast ─────────────────────────────────────────────────────────────────
function Toast({ msg, tipo, onClose }) {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onClose, 3800);
    return () => clearTimeout(t);
  }, [msg, onClose]);
  if (!msg) return null;
  const mapa = {
    exito: { bg: C.verdeClaro, borde: C.verde, texto: '#15803D', icono: '✓' },
    error: { bg: C.rojoClaro,  borde: C.rojo,  texto: '#B91C1C', icono: '✕' },
    info:  { bg: C.azulClaro,  borde: C.azul,  texto: '#1D4ED8', icono: 'ℹ' },
  };
  const { bg, borde, texto, icono } = mapa[tipo] || mapa.info;
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: 10,
      background: bg, border: `1.5px solid ${borde}`, color: texto,
      padding: '12px 18px', borderRadius: 10, boxShadow: sombraGrande,
      fontFamily: '"DM Sans", sans-serif', fontWeight: 500, fontSize: 14,
      animation: 'slideUp 0.22s ease',
    }}>
      <span style={{
        width: 22, height: 22, borderRadius: '50%', background: borde,
        color: '#fff', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0,
      }}>{icono}</span>
      {msg}
    </div>
  );
}

// ─── Modal base ────────────────────────────────────────────────────────────
function Modal({ titulo, subtitulo, ancho = 460, children, onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(28,25,23,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }} onClick={onClose}>
      <div style={{
        background: C.blanco, borderRadius: 16,
        width: '100%', maxWidth: ancho, boxShadow: sombraGrande,
        animation: 'popIn 0.18s ease', overflow: 'hidden',
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          padding: '22px 28px 18px', borderBottom: `1px solid ${C.gris200}`,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.gris900, fontFamily: '"DM Sans", sans-serif' }}>{titulo}</h2>
            {subtitulo && <p style={{ margin: '3px 0 0', fontSize: 13, color: C.gris400, fontFamily: '"DM Sans", sans-serif' }}>{subtitulo}</p>}
          </div>
          <button onClick={onClose} style={{
            background: C.gris200, border: 'none', borderRadius: 8,
            width: 30, height: 30, cursor: 'pointer', fontSize: 15, color: C.gris600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>✕</button>
        </div>
        <div style={{ padding: '22px 28px' }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Botón ─────────────────────────────────────────────────────────────────
function Btn({ children, onClick, disabled, variante = 'primario', full = false, small = false }) {
  const [hov, setHov] = useState(false);
  const e = {
    primario:   { bg: hov ? C.naranjaOsc : C.naranja,  color: C.blanco,  border: 'none' },
    secundario: { bg: hov ? C.naranjaClaro : C.blanco,  color: C.naranja, border: `1.5px solid ${C.naranja}` },
    peligro:    { bg: hov ? '#B91C1C' : C.rojo,         color: C.blanco,  border: 'none' },
    neutro:     { bg: hov ? C.gris200 : C.blanco,       color: C.gris600, border: `1.5px solid ${C.gris200}` },
  }[variante];
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width: full ? '100%' : undefined, padding: small ? '5px 12px' : '9px 18px',
        borderRadius: 8, border: e.border || 'none',
        background: disabled ? C.gris200 : e.bg,
        color: disabled ? C.gris400 : e.color,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: small ? 12 : 14, fontWeight: 700, fontFamily: '"DM Sans", sans-serif',
        transition: 'background 0.14s', display: 'inline-flex', alignItems: 'center', gap: 6,
      }}>{children}</button>
  );
}

// ─── Campo input ───────────────────────────────────────────────────────────
function Campo({ label, value, onChange, placeholder, error, autoFocus }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{
        display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700,
        color: C.gris600, textTransform: 'uppercase', letterSpacing: '0.06em',
        fontFamily: '"DM Sans", sans-serif',
      }}>{label}</label>}
      <input
        type="text" value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} autoFocus={autoFocus}
        style={{
          width: '100%', padding: '10px 13px', borderRadius: 8, boxSizing: 'border-box',
          border: `1.5px solid ${error ? C.rojo : C.gris200}`,
          fontSize: 14, fontFamily: '"DM Sans", sans-serif', color: C.gris900,
          background: error ? C.rojoClaro : C.blanco, outline: 'none',
        }}
        onFocus={e => { e.target.style.borderColor = error ? C.rojo : C.naranja; }}
        onBlur={e => { e.target.style.borderColor = error ? C.rojo : C.gris200; }}
      />
      {error && <p style={{ margin: '4px 0 0', fontSize: 11, color: C.rojo, fontFamily: '"DM Sans", sans-serif' }}>{error}</p>}
    </div>
  );
}

// ─── Modal: Crear / Editar recurso ─────────────────────────────────────────
function ModalFormRecurso({ inicial, onGuardar, onCerrar, cargando }) {
  const [nombre,  setNombre]  = useState(inicial?.nombre || '');
  const [error,   setError]   = useState('');

  const validar = () => {
    if (!nombre.trim()) { setError('El nombre es obligatorio'); return false; }
    setError('');
    return true;
  };

  return (
    <Modal
      titulo={inicial ? 'Editar recurso' : 'Nuevo recurso'}
      subtitulo={inicial ? `Modificando "${inicial.nombre}"` : 'Agrega un recurso al catálogo institucional'}
      onClose={onCerrar}
    >
      <Campo
        label="Nombre del recurso"
        value={nombre} onChange={setNombre}
        placeholder="Ej: Televisor, Proyector, Computador…"
        error={error} autoFocus
      />

      {/* Sugerencias rápidas */}
      {!inicial && (
        <div style={{ marginBottom: 20 }}>
          <p style={{
            margin: '0 0 8px', fontSize: 11, color: C.gris400,
            fontFamily: '"DM Sans", sans-serif', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>Sugerencias</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {['Proyector', 'Televisor', 'Computador', 'Tablero inteligente', 'Aire acondicionado', 'Microfóno'].map(s => (
              <button key={s} onClick={() => setNombre(s)} style={{
                padding: '4px 10px', borderRadius: 8, cursor: 'pointer',
                border: `1.5px solid ${nombre === s ? C.naranja : C.gris200}`,
                background: nombre === s ? C.naranjaClaro : C.blanco,
                color: nombre === s ? C.naranja : C.gris600,
                fontSize: 12, fontWeight: 600, fontFamily: '"DM Sans", sans-serif',
                transition: 'all 0.14s',
              }}>{s}</button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <Btn variante="neutro" onClick={onCerrar} full>Cancelar</Btn>
        <Btn variante="primario" disabled={cargando} full
          onClick={() => { if (validar()) onGuardar({ nombre: nombre.trim() }); }}
        >{cargando ? 'Guardando…' : inicial ? 'Guardar cambios' : '＋ Crear recurso'}</Btn>
      </div>
    </Modal>
  );
}

// ─── Modal: Detalle de recurso ─────────────────────────────────────────────
function ModalDetalle({ recurso, detalle, cargandoDetalle, onCerrar, onEditar, onEliminar }) {
  return (
    <Modal titulo="Detalle del recurso" onClose={onCerrar}>
      {/* Cabecera */}
      <div style={{
        background: `linear-gradient(135deg, ${C.naranja}, ${C.naranjaOsc})`,
        borderRadius: 12, padding: '16px 18px', marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{
          width: 46, height: 46, borderRadius: 11,
          background: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
        }}>🔧</div>
        <div>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.blanco, fontFamily: '"DM Sans", sans-serif' }}>
            {recurso.nombre}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.7)', fontFamily: '"DM Sans", sans-serif' }}>
            ID #{recurso.id}
          </p>
        </div>
      </div>

      {/* Stat: salones que lo usan */}
      <div style={{
        background: C.azulClaro, border: `1.5px solid ${C.azul}25`,
        borderRadius: 10, padding: '12px 16px', marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ fontSize: 20 }}>🏫</span>
        <div>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: C.gris900, fontFamily: '"DM Sans", sans-serif', lineHeight: 1 }}>
            {recurso.totalSalones ?? '—'}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: 11, color: C.azul, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: '"DM Sans", sans-serif' }}>
            Salones con este recurso
          </p>
        </div>
      </div>

      {/* Lista de salones (del detalle) */}
      {cargandoDetalle ? (
        <div style={{ textAlign: 'center', padding: '16px 0', color: C.gris400, fontFamily: '"DM Sans", sans-serif', fontSize: 13 }}>
          Cargando salones…
        </div>
      ) : detalle?.salones?.length > 0 ? (
        <div style={{ marginBottom: 20 }}>
          <p style={{
            margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: C.gris600,
            textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: '"DM Sans", sans-serif',
          }}>Salones asignados</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 180, overflowY: 'auto' }}>
            {detalle.salones.map(s => (
              <div key={s.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: C.gris50, border: `1.5px solid ${C.gris200}`,
                borderRadius: 8, padding: '8px 12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14 }}>🏫</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.gris900, fontFamily: '"DM Sans", sans-serif' }}>{s.nombre}</span>
                </div>
                <span style={{
                  background: C.azulClaro, color: C.azul,
                  padding: '2px 8px', borderRadius: 20,
                  fontSize: 11, fontWeight: 700, fontFamily: '"DM Sans", sans-serif',
                }}>👥 {s.capacidad}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{
          background: C.gris50, border: `1.5px dashed ${C.gris200}`,
          borderRadius: 10, padding: '14px', marginBottom: 20, textAlign: 'center',
        }}>
          <p style={{ margin: 0, fontSize: 13, color: C.gris400, fontStyle: 'italic', fontFamily: '"DM Sans", sans-serif' }}>
            Este recurso no está asignado a ningún salón aún.
          </p>
        </div>
      )}

      {/* Acciones */}
      <div style={{ display: 'flex', gap: 8 }}>
        <Btn variante="neutro" onClick={onCerrar} full>Cerrar</Btn>
        <Btn variante="secundario" onClick={() => { onCerrar(); onEditar(recurso); }} full>✏️ Editar</Btn>
        {(recurso.totalSalones === 0) && (
          <Btn variante="peligro" onClick={() => { onCerrar(); onEliminar(recurso); }} full>🗑️ Eliminar</Btn>
        )}
      </div>
    </Modal>
  );
}

// ─── Modal: Confirmar eliminación ─────────────────────────────────────────
function ModalEliminar({ recurso, onConfirmar, onCerrar, cargando }) {
  return (
    <Modal titulo="Eliminar recurso" onClose={onCerrar}>
      <div style={{
        background: C.rojoClaro, border: `1px solid #FECACA`,
        borderRadius: 10, padding: '14px 16px', marginBottom: 20,
        display: 'flex', gap: 10,
      }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
        <p style={{ margin: 0, fontSize: 14, color: '#7F1D1D', fontFamily: '"DM Sans", sans-serif', lineHeight: 1.6 }}>
          ¿Eliminar <strong>{recurso.nombre}</strong>? Solo es posible si no está asignado a ningún salón.
        </p>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <Btn variante="neutro" onClick={onCerrar} full>Cancelar</Btn>
        <Btn variante="peligro" onClick={onConfirmar} disabled={cargando} full>
          {cargando ? 'Eliminando…' : 'Sí, eliminar'}
        </Btn>
      </div>
    </Modal>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{ background: C.blanco, border: `1.5px solid ${C.gris200}`, borderRadius: 13, padding: '18px 20px' }}>
      {[65, 40, 80].map((w, i) => (
        <div key={i} style={{
          height: 12, width: `${w}%`, background: C.gris200, borderRadius: 6,
          marginBottom: 10, animation: 'pulse 1.4s ease-in-out infinite',
          animationDelay: `${i * 0.12}s`,
        }} />
      ))}
    </div>
  );
}

// ─── Tarjeta de recurso ────────────────────────────────────────────────────
function TarjetaRecurso({ recurso, onVer, onEditar, onEliminar }) {
  const [hover, setHover] = useState(false);

  // Color dinámico basado en el nombre
  const hue = [...(recurso.nombre || '')].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  const colorFondo = `hsl(${hue}, 55%, 94%)`;
  const colorTexto = `hsl(${hue}, 55%, 35%)`;

  return (
    <div
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: C.blanco,
        border: `1.5px solid ${hover ? C.naranja : C.gris200}`,
        borderRadius: 13, padding: '18px 20px',
        boxShadow: hover ? sombraMedia : sombra,
        transform: hover ? 'translateY(-2px)' : 'none',
        transition: 'all 0.18s ease',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}
    >
      {/* Ícono + nombre */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 11, flexShrink: 0,
          background: colorFondo,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
        }}>🔧</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            margin: 0, fontSize: 15, fontWeight: 800, color: C.gris900,
            fontFamily: '"DM Sans", sans-serif',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{recurso.nombre}</p>
          <p style={{ margin: 0, fontSize: 11, color: C.gris400, fontFamily: '"DM Sans", sans-serif' }}>
            ID #{recurso.id}
          </p>
        </div>
      </div>

      {/* Salones que lo usan */}
      <div style={{
        background: recurso.totalSalones > 0 ? C.azulClaro : C.gris100,
        border: `1px solid ${recurso.totalSalones > 0 ? C.azul + '30' : C.gris200}`,
        borderRadius: 8, padding: '8px 12px',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ fontSize: 15 }}>🏫</span>
        <p style={{
          margin: 0, fontSize: 13, fontWeight: 700,
          color: recurso.totalSalones > 0 ? C.azul : C.gris400,
          fontFamily: '"DM Sans", sans-serif',
        }}>
          {recurso.totalSalones > 0
            ? `Usado en ${recurso.totalSalones} salón${recurso.totalSalones !== 1 ? 'es' : ''}`
            : 'Sin salones asignados'}
        </p>
      </div>

      {/* Acciones */}
      <div style={{ borderTop: `1px solid ${C.gris200}`, paddingTop: 12, display: 'flex', gap: 6 }}>
        <Btn variante="neutro" small full onClick={() => onVer(recurso)}>👁 Ver</Btn>
        <Btn variante="secundario" small full onClick={() => onEditar(recurso)}>✏️ Editar</Btn>
        {recurso.totalSalones === 0 && (
          <Btn variante="peligro" small onClick={() => onEliminar(recurso)}>🗑️</Btn>
        )}
      </div>
    </div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────
export default function GestionRecursos() {
  const navigate = useNavigate();

  const [recursos,        setRecursos]        = useState([]);
  const [cargando,        setCargando]        = useState(true);
  const [busqueda,        setBusqueda]        = useState('');
  const [filtroUso,       setFiltroUso]       = useState('Todos'); // Todos | En uso | Sin usar

  const [modalCrear,      setModalCrear]      = useState(false);
  const [recursoEditar,   setRecursoEditar]   = useState(null);
  const [recursoEliminar, setRecursoEliminar] = useState(null);
  const [recursoVer,      setRecursoVer]      = useState(null);
  const [detalleRecurso,  setDetalleRecurso]  = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  const [guardando, setGuardando] = useState(false);
  const [toast,     setToast]     = useState({ msg: '', tipo: 'info' });

  const mostrarToast = useCallback((msg, tipo = 'info') => setToast({ msg, tipo }), []);

  const cargarRecursos = useCallback(async () => {
    setCargando(true);
    try {
      const data = await getRecursos();
      setRecursos(data);
    } catch (e) {
      mostrarToast(e.message, 'error');
    } finally { setCargando(false); }
  }, [mostrarToast]);

  useEffect(() => { cargarRecursos(); }, [cargarRecursos]);

  // Cargar detalle al abrir modal de ver
  const handleVer = async (recurso) => {
    setRecursoVer(recurso);
    setDetalleRecurso(null);
    setCargandoDetalle(true);
    try {
      const data = await getRecurso(recurso.id);
      setDetalleRecurso(data);
    } catch { /* silencioso */ }
    finally { setCargandoDetalle(false); }
  };

  // ── Filtrado ──
  const recursosFiltrados = recursos.filter(r => {
    const coincideNombre = !busqueda || r.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideUso =
      filtroUso === 'Todos'    ? true :
      filtroUso === 'En uso'   ? r.totalSalones > 0 :
      /* Sin usar */             r.totalSalones === 0;
    return coincideNombre && coincideUso;
  });

  // ── Handlers ──
  const handleCrear = async (datos) => {
    setGuardando(true);
    try {
      await crearRecurso(datos);
      mostrarToast('Recurso creado correctamente ✓', 'exito');
      setModalCrear(false);
      cargarRecursos();
    } catch (e) { mostrarToast(e.message, 'error'); }
    finally { setGuardando(false); }
  };

  const handleEditar = async (datos) => {
    setGuardando(true);
    try {
      await editarRecurso(recursoEditar.id, datos);
      mostrarToast('Recurso actualizado correctamente ✓', 'exito');
      setRecursoEditar(null);
      cargarRecursos();
    } catch (e) { mostrarToast(e.message, 'error'); }
    finally { setGuardando(false); }
  };

  const handleEliminar = async () => {
    setGuardando(true);
    try {
      await eliminarRecurso(recursoEliminar.id);
      mostrarToast('Recurso eliminado correctamente ✓', 'exito');
      setRecursoEliminar(null);
      cargarRecursos();
    } catch (e) { mostrarToast(e.message, 'error'); }
    finally { setGuardando(false); }
  };

  // ── Stats ──
  const totalRecursos = recursos.length;
  const enUso         = recursos.filter(r => r.totalSalones > 0).length;
  const sinUsar       = recursos.filter(r => r.totalSalones === 0).length;
  const masUsado      = recursos.length
    ? recursos.reduce((a, b) => (a.totalSalones > b.totalSalones ? a : b))
    : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap');
        @keyframes slideUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes popIn   { from{opacity:0;transform:scale(0.96)}      to{opacity:1;transform:scale(1)}      }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.4} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.gris200}; border-radius: 99px; }
      `}</style>

      <div style={{ minHeight: '100vh', background: C.gris100, fontFamily: '"DM Sans", sans-serif', padding: '32px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          {/* ── Encabezado ── */}
          <div style={{
            display: 'flex', alignItems: 'flex-start',
            justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 28,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {/* Botón volver */}
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: C.blanco, border: `1.5px solid ${C.gris200}`,
                  borderRadius: 8, padding: '7px 14px', cursor: 'pointer',
                  fontSize: 13, fontWeight: 700, color: C.gris600,
                  fontFamily: '"DM Sans", sans-serif',
                  marginBottom: 16, boxShadow: sombra,
                }}
              >
                ← Volver
              </button>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, background: C.naranja,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                  }}>🔧</div>
                  <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: C.gris900 }}>
                    Gestión de Recursos
                  </h1>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: C.gris400 }}>
                  Catálogo institucional de recursos disponibles
                </p>
              </div>
            </div>

            <button onClick={() => setModalCrear(true)} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: C.naranja, color: C.blanco, border: 'none',
              padding: '10px 20px', borderRadius: 10, cursor: 'pointer',
              fontSize: 14, fontWeight: 700, fontFamily: '"DM Sans", sans-serif',
              boxShadow: `0 2px 8px ${C.naranja}55`, transition: 'background 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = C.naranjaOsc; }}
            onMouseLeave={e => { e.currentTarget.style.background = C.naranja; }}
            >＋ Nuevo recurso</button>
          </div>

          {/* ── Stats ── */}
          <div style={{ display: 'grid', gap: 12, marginBottom: 24, gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
            {[
              { icono: '🔧', valor: totalRecursos,             label: 'Total recursos',  color: C.naranja, bg: C.naranjaClaro },
              { icono: '✅', valor: enUso,                      label: 'En uso',          color: C.verde,   bg: C.verdeClaro   },
              { icono: '📦', valor: sinUsar,                    label: 'Sin asignar',     color: C.amarillo,bg: C.amarilloClaro},
              { icono: '🏆', valor: masUsado?.nombre || '—',    label: 'Más usado',       color: C.azul,    bg: C.azulClaro    },
            ].map(({ icono, valor, label, color, bg }) => (
              <div key={label} style={{
                background: bg, border: `1.5px solid ${color}25`,
                borderRadius: 12, padding: '14px 18px',
                display: 'flex', alignItems: 'center', gap: 10, boxShadow: sombra,
              }}>
                <span style={{ fontSize: 20 }}>{icono}</span>
                <div style={{ minWidth: 0 }}>
                  <p style={{
                    margin: 0, fontSize: typeof valor === 'string' ? 13 : 20,
                    fontWeight: 800, color: C.gris900, fontFamily: '"DM Sans", sans-serif',
                    lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{valor}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 10, color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: '"DM Sans", sans-serif' }}>{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Filtros ── */}
          <div style={{
            background: C.blanco, border: `1.5px solid ${C.gris200}`,
            borderRadius: 12, padding: '14px 18px', marginBottom: 20,
            display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', boxShadow: sombra,
          }}>
            {/* Búsqueda */}
            <div style={{ position: 'relative', flex: '1 1 200px' }}>
              <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: C.gris400, fontSize: 14 }}>🔍</span>
              <input type="text" placeholder="Buscar por nombre…" value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                style={{
                  width: '100%', padding: '9px 12px 9px 32px', borderRadius: 8,
                  border: `1.5px solid ${C.gris200}`, fontSize: 13,
                  color: C.gris900, fontFamily: '"DM Sans", sans-serif',
                  background: C.gris50, outline: 'none', boxSizing: 'border-box',
                }}
                onFocus={e => { e.target.style.borderColor = C.naranja; }}
                onBlur={e => { e.target.style.borderColor = C.gris200; }}
              />
            </div>

            {/* Filtro uso */}
            <div style={{ display: 'flex', gap: 6 }}>
              {['Todos', 'En uso', 'Sin usar'].map(f => {
                const activo = filtroUso === f;
                return (
                  <button key={f} onClick={() => setFiltroUso(f)} style={{
                    padding: '5px 12px', borderRadius: 8, cursor: 'pointer',
                    border: `1.5px solid ${activo ? C.naranja : C.gris200}`,
                    background: activo ? C.naranjaClaro : C.blanco,
                    color: activo ? C.naranja : C.gris600,
                    fontSize: 12, fontWeight: 700, fontFamily: '"DM Sans", sans-serif',
                    transition: 'all 0.14s',
                  }}>{f}</button>
                );
              })}
            </div>

            {(busqueda || filtroUso !== 'Todos') && (
              <button onClick={() => { setBusqueda(''); setFiltroUso('Todos'); }} style={{
                padding: '5px 12px', borderRadius: 8, cursor: 'pointer',
                border: `1.5px solid ${C.gris200}`, background: C.blanco,
                color: C.gris600, fontSize: 12, fontWeight: 700,
                fontFamily: '"DM Sans", sans-serif',
              }}>✕ Limpiar</button>
            )}

            <span style={{ marginLeft: 'auto', fontSize: 12, color: C.gris400, fontFamily: '"DM Sans", sans-serif' }}>
              {recursosFiltrados.length} resultado{recursosFiltrados.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* ── Grid ── */}
          {cargando ? (
            <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
              {[...Array(6)].map((_, i) => <Skeleton key={i} />)}
            </div>
          ) : recursosFiltrados.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '60px 24px',
              background: C.blanco, borderRadius: 14, border: `1.5px dashed ${C.gris200}`,
            }}>
              <p style={{ fontSize: 38, margin: '0 0 10px' }}>🔧</p>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.gris900 }}>
                {busqueda || filtroUso !== 'Todos' ? 'Sin resultados' : 'No hay recursos aún'}
              </p>
              <p style={{ margin: '6px 0 0', fontSize: 13, color: C.gris400 }}>
                {busqueda || filtroUso !== 'Todos'
                  ? 'Prueba con otros filtros.'
                  : 'Crea el primer recurso con el botón de arriba.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
              {recursosFiltrados.map(r => (
                <TarjetaRecurso
                  key={r.id} recurso={r}
                  onVer={handleVer}
                  onEditar={setRecursoEditar}
                  onEliminar={setRecursoEliminar}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Modales ── */}
      {modalCrear && (
        <ModalFormRecurso onGuardar={handleCrear} onCerrar={() => setModalCrear(false)} cargando={guardando} />
      )}
      {recursoEditar && (
        <ModalFormRecurso inicial={recursoEditar} onGuardar={handleEditar} onCerrar={() => setRecursoEditar(null)} cargando={guardando} />
      )}
      {recursoEliminar && (
        <ModalEliminar recurso={recursoEliminar} onConfirmar={handleEliminar} onCerrar={() => setRecursoEliminar(null)} cargando={guardando} />
      )}
      {recursoVer && (
        <ModalDetalle
          recurso={recursoVer} detalle={detalleRecurso} cargandoDetalle={cargandoDetalle}
          onCerrar={() => { setRecursoVer(null); setDetalleRecurso(null); }}
          onEditar={setRecursoEditar} onEliminar={setRecursoEliminar}
        />
      )}

      <Toast msg={toast.msg} tipo={toast.tipo} onClose={() => setToast({ msg: '', tipo: 'info' })} />
    </>
  );
}