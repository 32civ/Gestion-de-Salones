import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  getSemestres, crearSemestre, editarSemestre, eliminarSemestre,
} from '../../api/semestresApi';

// ─── Paleta ────────────────────────────────────────────────────────────────
const C = {
  naranja: '#E8611A', naranjaOsc: '#C4511A', naranjaClaro: '#FFF0E6',
  blanco: '#FFFFFF', gris50: '#FAFAF9', gris100: '#F5F4F2',
  gris200: '#E8E6E1', gris400: '#B0ADA6', gris600: '#6B6860',
  gris900: '#1C1917', verde: '#16A34A', verdeClaro: '#DCFCE7',
  rojo: '#DC2626', rojoClaro: '#FEE2E2', azul: '#2563EB', azulClaro: '#DBEAFE',
  amarillo: '#D97706', amarilloClaro: '#FEF3C7',
};
const sombra      = '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05)';
const sombraMedia = '0 4px 12px rgba(0,0,0,0.09), 0 2px 4px rgba(0,0,0,0.06)';
const sombraGrande = '0 12px 30px rgba(0,0,0,0.13), 0 4px 10px rgba(0,0,0,0.08)';

// ─── Sidebar ───────────────────────────────────────────────────────────────
function Sidebar({ onCerrarSesion }) {
  const navigate  = useNavigate();
  const location  = useLocation();

  const navItems = [
    { label: 'Dashboard',      path: '/dashboard',
      icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
    { label: 'Salones',        path: '/salones',
      icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5V19a1 1 0 001 1h6v-5h4v5h6a1 1 0 001-1v-8.5M9 21V12h6v9M3 10.5L12 3l9 7.5"/></svg> },
    { label: 'Horarios',       path: '/horarios',
      icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg> },
    { label: 'Asignaciones',   path: '/asignaciones',
      icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg> },
    { label: 'Carreras y Cursos', path: '/admin/carreras-cursos',
      icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg> },
    { label: 'Semestres',      path: '/semestres',
      icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/><circle cx="12" cy="15" r="2" fill="currentColor"/></svg> },
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
            <p style={{ fontSize: 11, color: C.gris400, margin: 0, fontFamily: '"DM Sans", sans-serif' }}>Admin Académico</p>
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

// ─── Toast ─────────────────────────────────────────────────────────────────
function Toast({ msg, tipo, onClose }) {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [msg, onClose]);
  if (!msg) return null;
  const mapa = {
    exito: { bg: C.verdeClaro,    borde: C.verde,  texto: '#15803D', icono: '✓' },
    error: { bg: C.rojoClaro,     borde: C.rojo,   texto: '#B91C1C', icono: '✕' },
    info:  { bg: C.azulClaro,     borde: C.azul,   texto: '#1D4ED8', icono: 'ℹ' },
  };
  const { bg, borde, texto, icono } = mapa[tipo] || mapa.info;
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: 10,
      background: bg, border: `1.5px solid ${borde}`, color: texto,
      padding: '12px 18px', borderRadius: 10, boxShadow: sombraGrande,
      fontFamily: '"DM Sans", sans-serif', fontWeight: 500, fontSize: 14,
      animation: 'slideUp 0.22s ease', maxWidth: 360,
    }}>
      <span style={{ width: 22, height: 22, borderRadius: '50%', background: borde, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{icono}</span>
      {msg}
    </div>
  );
}

// ─── Modal base ────────────────────────────────────────────────────────────
function Modal({ titulo, subtitulo, children, onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(28,25,23,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }} onClick={onClose}>
      <div style={{
        background: C.blanco, borderRadius: 16, width: '100%', maxWidth: 460,
        boxShadow: sombraGrande, animation: 'popIn 0.18s ease', overflow: 'hidden',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '22px 28px 18px', borderBottom: `1px solid ${C.gris200}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.gris900, fontFamily: '"DM Sans", sans-serif' }}>{titulo}</h2>
            {subtitulo && <p style={{ margin: '3px 0 0', fontSize: 13, color: C.gris400, fontFamily: '"DM Sans", sans-serif' }}>{subtitulo}</p>}
          </div>
          <button onClick={onClose} style={{ background: C.gris200, border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', fontSize: 15, color: C.gris600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
        <div style={{ padding: '22px 28px' }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Input ─────────────────────────────────────────────────────────────────
function Input({ label, value, onChange, type = 'text', error }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700, color: C.gris600, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: '"DM Sans", sans-serif' }}>{label}</label>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: '100%', padding: '10px 13px', borderRadius: 8, boxSizing: 'border-box',
          border: `1.5px solid ${error ? C.rojo : focused ? C.naranja : C.gris200}`,
          fontSize: 14, fontFamily: '"DM Sans", sans-serif', color: C.gris900,
          background: error ? C.rojoClaro : C.blanco, outline: 'none',
        }}
      />
      {error && <p style={{ margin: '4px 0 0', fontSize: 11, color: C.rojo, fontFamily: '"DM Sans", sans-serif' }}>{error}</p>}
    </div>
  );
}

// ─── Botón ─────────────────────────────────────────────────────────────────
function Btn({ children, onClick, disabled, variante = 'primario', full = false, small = false }) {
  const [hov, setHov] = useState(false);
  const e = {
    primario:   { bg: hov ? C.naranjaOsc : C.naranja, color: C.blanco,  border: 'none' },
    secundario: { bg: hov ? C.naranjaClaro : C.blanco, color: C.naranja, border: `1.5px solid ${C.naranja}` },
    peligro:    { bg: hov ? '#B91C1C' : C.rojo,        color: C.blanco,  border: 'none' },
    neutro:     { bg: hov ? C.gris200 : C.blanco,      color: C.gris600, border: `1.5px solid ${C.gris200}` },
  }[variante];
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width: full ? '100%' : undefined, padding: small ? '5px 12px' : '9px 18px',
        borderRadius: 8, border: e.border || 'none',
        background: disabled ? C.gris200 : e.bg, color: disabled ? C.gris400 : e.color,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: small ? 12 : 14, fontWeight: 700, fontFamily: '"DM Sans", sans-serif',
        transition: 'background 0.14s', display: 'inline-flex', alignItems: 'center', gap: 6,
      }}>{children}</button>
  );
}

// ─── Formulario de semestre ────────────────────────────────────────────────
function FormSemestre({ inicial, onGuardar, onCerrar, guardando }) {
  const [nombre,      setNombre]      = useState(inicial?.nombre      || '');
  const [fechaInicio, setFechaInicio] = useState(inicial?.fechaInicio || '');
  const [fechaFin,    setFechaFin]    = useState(inicial?.fechaFin    || '');
  const [errores,     setErrores]     = useState({});

  const validar = () => {
    const e = {};
    if (!nombre.trim())   e.nombre      = 'El nombre es obligatorio';
    if (!fechaInicio)     e.fechaInicio = 'La fecha de inicio es obligatoria';
    if (!fechaFin)        e.fechaFin    = 'La fecha de fin es obligatoria';
    if (fechaInicio && fechaFin && fechaFin <= fechaInicio)
      e.fechaFin = 'La fecha de fin debe ser mayor a la de inicio';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const handleGuardar = () => {
    if (!validar()) return;
    onGuardar({ nombre: nombre.trim(), fechaInicio, fechaFin });
  };

  return (
    <>
      <Input label="Nombre" value={nombre} onChange={setNombre}
        error={errores.nombre} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Input label="Fecha inicio" value={fechaInicio} onChange={setFechaInicio}
          type="date" error={errores.fechaInicio} />
        <Input label="Fecha fin" value={fechaFin} onChange={setFechaFin}
          type="date" error={errores.fechaFin} />
      </div>

      {/* Preview semestre activo */}
      {fechaInicio && fechaFin && (
        <div style={{
          background: C.azulClaro, border: `1px solid ${C.azul}30`,
          borderRadius: 8, padding: '10px 14px', marginBottom: 16,
          display: 'flex', gap: 8, alignItems: 'center',
        }}>
          <span>📅</span>
          <p style={{ margin: 0, fontSize: 12, color: '#1E40AF', fontFamily: '"DM Sans", sans-serif' }}>
            Duración: {Math.ceil((new Date(fechaFin) - new Date(fechaInicio)) / (1000 * 60 * 60 * 24))} días
          </p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <Btn variante="neutro" onClick={onCerrar} full>Cancelar</Btn>
        <Btn variante="primario" onClick={handleGuardar} disabled={guardando} full>
          {guardando ? 'Guardando…' : inicial ? '✓ Guardar cambios' : '✓ Crear semestre'}
        </Btn>
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════
export default function GestionSemestres() {
  const navigate = useNavigate();

  const [semestres,  setSemestres]  = useState([]);
  const [cargando,   setCargando]   = useState(true);
  const [guardando,  setGuardando]  = useState(false);
  const [modal,      setModal]      = useState(null); // null | 'crear' | 'editar' | 'eliminar'
  const [seleccionado, setSeleccionado] = useState(null);
  const [toast,      setToast]      = useState({ msg: '', tipo: 'info' });

  const mostrarToast = useCallback((msg, tipo = 'info') => setToast({ msg, tipo }), []);

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/');
  };

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const data = await getSemestres();
      setSemestres(data);
    } catch (e) {
      mostrarToast(e.message, 'error');
    } finally { setCargando(false); }
  }, [mostrarToast]);

  useEffect(() => { cargar(); }, [cargar]);

  const handleCrear = async (datos) => {
    setGuardando(true);
    try {
      await crearSemestre(datos);
      mostrarToast('Semestre creado correctamente ✓', 'exito');
      setModal(null);
      cargar();
    } catch (e) {
      mostrarToast(e.message, 'error');
    } finally { setGuardando(false); }
  };

  const handleEditar = async (datos) => {
    setGuardando(true);
    try {
      await editarSemestre(seleccionado.id, datos);
      mostrarToast('Semestre actualizado correctamente ✓', 'exito');
      setModal(null);
      cargar();
    } catch (e) {
      mostrarToast(e.message, 'error');
    } finally { setGuardando(false); }
  };

  const handleEliminar = async () => {
    setGuardando(true);
    try {
      await eliminarSemestre(seleccionado.id);
      mostrarToast('Semestre eliminado correctamente ✓', 'exito');
      setModal(null);
      cargar();
    } catch (e) {
      mostrarToast(e.message, 'error');
    } finally { setGuardando(false); }
  };

  const semestreActivo = semestres.find(s => s.esActivo);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes slideUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes popIn   { from{opacity:0;transform:scale(0.96)}      to{opacity:1;transform:scale(1)}      }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.4} }
        * { box-sizing: border-box; }
      `}</style>

      <div style={{ minHeight: '100vh', background: C.gris100, display: 'flex', fontFamily: '"DM Sans", sans-serif' }}>

        <Sidebar onCerrarSesion={cerrarSesion} />

        <div style={{ flex: 1, padding: '2rem', overflow: 'auto' }}>

          {/* ── Encabezado ── */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button onClick={() => navigate(-1)} style={{
                width: 38, height: 38, borderRadius: 10, background: C.blanco,
                border: `1.5px solid ${C.gris200}`, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, color: C.gris600, boxShadow: sombra, transition: 'all 0.14s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.naranja; e.currentTarget.style.color = C.naranja; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.gris200; e.currentTarget.style.color = C.gris600; }}
              >←</button>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: C.naranja, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📅</div>
                  <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: C.gris900 }}>Semestres</h1>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: C.gris400 }}>
                  {semestres.length} semestre{semestres.length !== 1 ? 's' : ''} registrado{semestres.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <Btn variante="primario" onClick={() => setModal('crear')}>+ Nuevo semestre</Btn>
          </div>

          {/* ── Banner semestre activo ── */}
          {semestreActivo && (
            <div style={{
              background: `linear-gradient(135deg, ${C.naranja}, ${C.naranjaOsc})`,
              borderRadius: 14, padding: '18px 24px', marginBottom: 24,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              boxShadow: sombraMedia, flexWrap: 'wrap', gap: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 28 }}>🟢</span>
                <div>
                  <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Semestre activo</p>
                  <p style={{ margin: '2px 0 0', fontSize: 20, fontWeight: 800, color: C.blanco }}>{semestreActivo.nombre}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 24 }}>
                {[
                  { label: 'Inicio',  valor: new Date(semestreActivo.fechaInicio).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) },
                  { label: 'Fin',     valor: new Date(semestreActivo.fechaFin).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) },
                  { label: 'Cursos',  valor: semestreActivo.totalCursos ?? '—' },
                ].map(({ label, valor }) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 15, fontWeight: 700, color: C.blanco }}>{valor}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Lista ── */}
          {cargando ? (
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{ background: C.blanco, border: `1.5px solid ${C.gris200}`, borderRadius: 12, height: 130, animation: 'pulse 1.4s ease-in-out infinite' }} />
              ))}
            </div>
          ) : semestres.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px', background: C.blanco, borderRadius: 14, border: `1.5px dashed ${C.gris200}` }}>
              <p style={{ fontSize: 38, margin: '0 0 10px' }}>📅</p>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.gris900 }}>No hay semestres registrados</p>
              <p style={{ margin: '6px 0 0', fontSize: 13, color: C.gris400 }}>Crea el primer semestre para comenzar.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {semestres.map(s => {
                const activo = s.esActivo;
                const inicio = new Date(s.fechaInicio);
                const fin    = new Date(s.fechaFin);
                const hoy    = new Date();
                const pasado = fin < hoy && !activo;
                const futuro = inicio > hoy && !activo;

                const estadoColor = activo ? C.verde : pasado ? C.gris400 : C.azul;
                const estadoBg    = activo ? C.verdeClaro : pasado ? C.gris100 : C.azulClaro;
                const estadoLabel = activo ? '🟢 Activo' : pasado ? '⏹ Finalizado' : '🔵 Próximo';

                return (
                  <div key={s.id} style={{
                    background: C.blanco,
                    border: `1.5px solid ${activo ? C.naranja : C.gris200}`,
                    borderRadius: 13, padding: '18px 20px',
                    boxShadow: activo ? sombraMedia : sombra,
                    transition: 'all 0.18s ease',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.gris900, fontFamily: '"DM Sans", sans-serif' }}>{s.nombre}</p>
                      <span style={{
                        background: estadoBg, color: estadoColor,
                        fontSize: 11, fontWeight: 700, padding: '3px 10px',
                        borderRadius: 20, fontFamily: '"DM Sans", sans-serif',
                      }}>{estadoLabel}</span>
                    </div>

                    <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
                      {[
                        { label: 'Inicio', valor: inicio.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) },
                        { label: 'Fin',    valor: fin.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) },
                        { label: 'Cursos', valor: s.totalCursos ?? 0 },
                      ].map(({ label, valor }) => (
                        <div key={label}>
                          <p style={{ margin: 0, fontSize: 10, color: C.gris400, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: '"DM Sans", sans-serif' }}>{label}</p>
                          <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 700, color: C.gris900, fontFamily: '"DM Sans", sans-serif' }}>{valor}</p>
                        </div>
                      ))}
                    </div>

                    <div style={{ borderTop: `1px solid ${C.gris200}`, paddingTop: 10, display: 'flex', gap: 6 }}>
                      <Btn variante="neutro" small full onClick={() => { setSeleccionado(s); setModal('editar'); }}>✏️ Editar</Btn>
                      {!activo && (
                        <Btn variante="peligro" small full onClick={() => { setSeleccionado(s); setModal('eliminar'); }}>🗑 Eliminar</Btn>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Modales ── */}
      {modal === 'crear' && (
        <Modal titulo="Nuevo semestre" subtitulo="Define las fechas del período académico" onClose={() => setModal(null)}>
          <FormSemestre onGuardar={handleCrear} onCerrar={() => setModal(null)} guardando={guardando} />
        </Modal>
      )}
      {modal === 'editar' && seleccionado && (
        <Modal titulo="Editar semestre" subtitulo={seleccionado.nombre} onClose={() => setModal(null)}>
          <FormSemestre
            inicial={{ nombre: seleccionado.nombre, fechaInicio: seleccionado.fechaInicio, fechaFin: seleccionado.fechaFin }}
            onGuardar={handleEditar} onCerrar={() => setModal(null)} guardando={guardando}
          />
        </Modal>
      )}
      {modal === 'eliminar' && seleccionado && (
        <Modal titulo="Eliminar semestre" onClose={() => setModal(null)}>
          <div style={{ background: C.rojoClaro, border: `1px solid #FECACA`, borderRadius: 10, padding: '14px 16px', marginBottom: 20, display: 'flex', gap: 10 }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
            <p style={{ margin: 0, fontSize: 14, color: '#7F1D1D', fontFamily: '"DM Sans", sans-serif', lineHeight: 1.6 }}>
              ¿Eliminar el semestre <strong>{seleccionado.nombre}</strong>? Solo se puede eliminar si no tiene cursos asociados.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn variante="neutro" onClick={() => setModal(null)} full>Cancelar</Btn>
            <Btn variante="peligro" onClick={handleEliminar} disabled={guardando} full>
              {guardando ? 'Eliminando…' : '🗑 Sí, eliminar'}
            </Btn>
          </div>
        </Modal>
      )}

      <Toast msg={toast.msg} tipo={toast.tipo} onClose={() => setToast({ msg: '', tipo: 'info' })} />
    </>
  );
}