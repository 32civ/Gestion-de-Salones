import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getCarreras, crearCarrera, editarCarrera, eliminarCarrera,
  getMaterias, crearMateria, editarMateria, eliminarMateria,
  getCursos, crearCurso, editarCurso, eliminarCurso,
  getDocentes,
} from '../../api/carrerasApi';

// ─── Paleta ────────────────────────────────────────────────────────────────
const C = {
  naranja: '#E8611A', naranjaOsc: '#C4511A', naranjaClaro: '#FFF0E6',
  blanco: '#FFFFFF', gris50: '#FAFAF9', gris100: '#F5F4F2',
  gris200: '#E8E6E1', gris400: '#B0ADA6', gris600: '#6B6860',
  gris900: '#1C1917', verde: '#16A34A', verdeClaro: '#DCFCE7',
  rojo: '#DC2626', rojoClaro: '#FEE2E2', azul: '#2563EB', azulClaro: '#DBEAFE',
  morado: '#7C3AED', moradoClaro: '#EDE9FE',
};
const sombra = '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05)';
const sombraMedia = '0 4px 12px rgba(0,0,0,0.09), 0 2px 4px rgba(0,0,0,0.06)';
const sombraGrande = '0 12px 30px rgba(0,0,0,0.13), 0 4px 10px rgba(0,0,0,0.08)';

// ─── Helpers token ─────────────────────────────────────────────────────────
const getRolDesdeToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return '';
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role || '';
  } catch { return ''; }
};
const ROLES_ESCRITURA = ['Administrador', 'Administrativo'];

// ─── Toast ─────────────────────────────────────────────────────────────────
function Toast({ msg, tipo, onClose }) {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [msg, onClose]);
  if (!msg) return null;
  const mapa = {
    exito: { bg: C.verdeClaro, borde: C.verde, texto: '#15803D', icono: '✓' },
    error: { bg: C.rojoClaro, borde: C.rojo, texto: '#B91C1C', icono: '✕' },
    info: { bg: C.azulClaro, borde: C.azul, texto: '#1D4ED8', icono: 'ℹ' },
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
      <span style={{
        width: 22, height: 22, borderRadius: '50%', background: borde,
        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 700, flexShrink: 0,
      }}>{icono}</span>
      {msg}
    </div>
  );
}

// ─── Modal base ────────────────────────────────────────────────────────────
function Modal({ titulo, subtitulo, ancho = 480, children, onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(28,25,23,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }} onClick={onClose}>
      <div style={{
        background: C.blanco, borderRadius: 16, width: '100%', maxWidth: ancho,
        boxShadow: sombraGrande, animation: 'popIn 0.18s ease',
        maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
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
        <div style={{ padding: '22px 28px', overflowY: 'auto' }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Botón ─────────────────────────────────────────────────────────────────
function Btn({ children, onClick, disabled, variante = 'primario', full = false, small = false }) {
  const [hov, setHov] = useState(false);
  const e = {
    primario: { bg: hov ? C.naranjaOsc : C.naranja, color: C.blanco, border: 'none' },
    secundario: { bg: hov ? C.naranjaClaro : C.blanco, color: C.naranja, border: `1.5px solid ${C.naranja}` },
    peligro: { bg: hov ? '#B91C1C' : C.rojo, color: C.blanco, border: 'none' },
    neutro: { bg: hov ? C.gris200 : C.blanco, color: C.gris600, border: `1.5px solid ${C.gris200}` },
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

// ─── Input ─────────────────────────────────────────────────────────────────
function Input({ label, value, onChange, placeholder, error, type = 'text' }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{
        display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700,
        color: C.gris600, textTransform: 'uppercase', letterSpacing: '0.06em',
        fontFamily: '"DM Sans", sans-serif',
      }}>{label}</label>}
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
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

// ─── Select ────────────────────────────────────────────────────────────────
function Select({ label, value, onChange, options, placeholder, error, disabled }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{
        display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700,
        color: C.gris600, textTransform: 'uppercase', letterSpacing: '0.06em',
        fontFamily: '"DM Sans", sans-serif',
      }}>{label}</label>}
      <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
        style={{
          width: '100%', padding: '10px 13px', borderRadius: 8, boxSizing: 'border-box',
          border: `1.5px solid ${error ? C.rojo : C.gris200}`,
          fontSize: 14, fontFamily: '"DM Sans", sans-serif',
          color: value ? C.gris900 : C.gris400,
          background: disabled ? C.gris100 : (error ? C.rojoClaro : C.blanco),
          outline: 'none', cursor: disabled ? 'not-allowed' : 'pointer', appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B6860' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
        }}
        onFocus={e => { e.target.style.borderColor = error ? C.rojo : C.naranja; }}
        onBlur={e => { e.target.style.borderColor = error ? C.rojo : C.gris200; }}
      >
        <option value="">{placeholder || 'Seleccionar…'}</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p style={{ margin: '4px 0 0', fontSize: 11, color: C.rojo, fontFamily: '"DM Sans", sans-serif' }}>{error}</p>}
    </div>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{ background: C.blanco, border: `1.5px solid ${C.gris200}`, borderRadius: 12, padding: '16px 18px' }}>
      {[60, 40, 80].map((w, i) => (
        <div key={i} style={{
          height: 12, width: `${w}%`, background: C.gris200, borderRadius: 6,
          marginBottom: 10, animation: 'pulse 1.4s ease-in-out infinite',
          animationDelay: `${i * 0.12}s`,
        }} />
      ))}
    </div>
  );
}

// ─── Modal Confirmar Eliminación ───────────────────────────────────────────
function ModalEliminar({ titulo, descripcion, onConfirmar, onCerrar, cargando }) {
  return (
    <Modal titulo="Confirmar eliminación" onClose={onCerrar}>
      <div style={{
        background: C.rojoClaro, border: `1px solid #FECACA`,
        borderRadius: 10, padding: '14px 16px', marginBottom: 20,
        display: 'flex', gap: 10,
      }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
        <div style={{ fontFamily: '"DM Sans", sans-serif' }}>
          <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: '#7F1D1D' }}>{titulo}</p>
          <p style={{ margin: 0, fontSize: 13, color: '#991B1B', lineHeight: 1.5 }}>{descripcion}</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <Btn variante="neutro" onClick={onCerrar} full>Cancelar</Btn>
        <Btn variante="peligro" onClick={onConfirmar} disabled={cargando} full>
          {cargando ? 'Eliminando…' : '🗑 Sí, eliminar'}
        </Btn>
      </div>
    </Modal>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// ─── TAB: CARRERAS ────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════
function TabCarreras({ puedeEditar, mostrarToast }) {
  const [carreras, setCarreras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [modal, setModal] = useState(null); // null | 'crear' | 'editar' | 'eliminar'
  const [seleccionada, setSeleccionada] = useState(null);
  const [form, setForm] = useState({ nombre: '' });
  const [errores, setErrores] = useState({});

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const data = await getCarreras();
      setCarreras(data);
    } catch (e) {
      mostrarToast(e.message, 'error');
    } finally { setCargando(false); }
  }, [mostrarToast]);

  useEffect(() => { cargar(); }, [cargar]);

  const filtradas = carreras.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const abrirCrear = () => { setForm({ nombre: '' }); setErrores({}); setModal('crear'); };
  const abrirEditar = (c) => { setSeleccionada(c); setForm({ nombre: c.nombre }); setErrores({}); setModal('editar'); };
  const abrirEliminar = (c) => { setSeleccionada(c); setModal('eliminar'); };

  const validar = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const handleGuardar = async () => {
    if (!validar()) return;
    setGuardando(true);
    try {
      if (modal === 'crear') {
        await crearCarrera(form.nombre.trim());
        mostrarToast('Carrera creada correctamente ✓', 'exito');
      } else {
        await editarCarrera(seleccionada.id, form.nombre.trim());
        mostrarToast('Carrera actualizada correctamente ✓', 'exito');
      }
      setModal(null);
      cargar();
    } catch (e) {
      mostrarToast(e.message, 'error');
    } finally { setGuardando(false); }
  };

  const handleEliminar = async () => {
    setGuardando(true);
    try {
      await eliminarCarrera(seleccionada.id);
      mostrarToast('Carrera eliminada correctamente ✓', 'exito');
      setModal(null);
      cargar();
    } catch (e) {
      mostrarToast(e.message, 'error');
    } finally { setGuardando(false); }
  };

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 220px' }}>
          <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: C.gris400, fontSize: 14 }}>🔍</span>
          <input type="text" placeholder="Buscar carrera…" value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{
              width: '100%', padding: '9px 12px 9px 32px', borderRadius: 8,
              border: `1.5px solid ${C.gris200}`, fontSize: 13, color: C.gris900,
              fontFamily: '"DM Sans", sans-serif', background: C.gris50, outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={e => { e.target.style.borderColor = C.naranja; }}
            onBlur={e => { e.target.style.borderColor = C.gris200; }}
          />
        </div>
        <span style={{ fontSize: 12, color: C.gris400, fontFamily: '"DM Sans", sans-serif' }}>
          {filtradas.length} resultado{filtradas.length !== 1 ? 's' : ''}
        </span>
        {puedeEditar && (
          <Btn variante="primario" onClick={abrirCrear}>+ Nueva carrera</Btn>
        )}
      </div>

      {/* Grid */}
      {cargando ? (
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
          {[...Array(4)].map((_, i) => <Skeleton key={i} />)}
        </div>
      ) : filtradas.length === 0 ? (
        <EstadoVacio
          icono="🎓"
          titulo={busqueda ? 'Sin resultados' : 'No hay carreras registradas'}
          descripcion={puedeEditar && !busqueda ? 'Crea la primera carrera para comenzar.' : 'Prueba con otro término de búsqueda.'}
        />
      ) : (
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
          {filtradas.map(c => (
            <TarjetaCarrera key={c.id} carrera={c} puedeEditar={puedeEditar}
              onEditar={abrirEditar} onEliminar={abrirEliminar} />
          ))}
        </div>
      )}

      {/* Modales */}
      {(modal === 'crear' || modal === 'editar') && (
        <Modal
          titulo={modal === 'crear' ? 'Nueva carrera' : 'Editar carrera'}
          subtitulo={modal === 'crear' ? 'Registra una nueva carrera académica' : `Modificando: ${seleccionada?.nombre}`}
          onClose={() => setModal(null)}
        >
          <Input label="Nombre de la carrera" value={form.nombre}
            onChange={v => setForm({ nombre: v })}
            placeholder="Ej: Ingeniería de Sistemas" error={errores.nombre} />
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <Btn variante="neutro" onClick={() => setModal(null)} full>Cancelar</Btn>
            <Btn variante="primario" onClick={handleGuardar} disabled={guardando} full>
              {guardando ? 'Guardando…' : modal === 'crear' ? '✓ Crear carrera' : '✓ Guardar cambios'}
            </Btn>
          </div>
        </Modal>
      )}
      {modal === 'eliminar' && (
        <ModalEliminar
          titulo={`¿Eliminar "${seleccionada?.nombre}"?`}
          descripcion="Esta acción no se puede deshacer. Solo se puede eliminar si no tiene materias asociadas."
          onConfirmar={handleEliminar} onCerrar={() => setModal(null)} cargando={guardando}
        />
      )}
    </div>
  );
}

function TarjetaCarrera({ carrera, puedeEditar, onEditar, onEliminar }) {
  const [hover, setHover] = useState(false);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: C.blanco, border: `1.5px solid ${hover ? C.naranja : C.gris200}`,
        borderRadius: 12, padding: '16px 18px',
        boxShadow: hover ? sombraMedia : sombra,
        transform: hover ? 'translateY(-2px)' : 'none',
        transition: 'all 0.18s ease',
      }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: C.naranjaClaro, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
        }}>🎓</div>
        <span style={{
          fontSize: 11, color: C.gris400, fontFamily: '"DM Sans", sans-serif',
          background: C.gris100, padding: '3px 8px', borderRadius: 20,
        }}>ID #{carrera.id}</span>
      </div>
      <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 800, color: C.gris900, fontFamily: '"DM Sans", sans-serif' }}>
        {carrera.nombre}
      </p>
      <p style={{ margin: '0 0 14px', fontSize: 12, color: C.gris400, fontFamily: '"DM Sans", sans-serif' }}>
        📚 {carrera.totalMaterias} materia{carrera.totalMaterias !== 1 ? 's' : ''}
      </p>
      {puedeEditar && (
        <div style={{ borderTop: `1px solid ${C.gris200}`, paddingTop: 10, display: 'flex', gap: 6 }}>
          <Btn variante="neutro" small full onClick={() => onEditar(carrera)}>✏️ Editar</Btn>
          <Btn variante="peligro" small full onClick={() => onEliminar(carrera)}>🗑 Eliminar</Btn>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// ─── TAB: MATERIAS ────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════
function TabMaterias({ puedeEditar, mostrarToast }) {
  const [materias, setMaterias] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroCarrera, setFiltroCarrera] = useState('');
  const [modal, setModal] = useState(null);
  const [seleccionada, setSeleccionada] = useState(null);
  const [form, setForm] = useState({ nombre: '', carreraId: '' });
  const [errores, setErrores] = useState({});

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const [m, c] = await Promise.allSettled([getMaterias(), getCarreras()]);
      if (m.status === 'fulfilled') setMaterias(m.value);
      if (c.status === 'fulfilled') setCarreras(c.value);
      if (m.status === 'rejected') mostrarToast(m.reason.message, 'error');
    } finally { setCargando(false); }
  }, [mostrarToast]);

  useEffect(() => { cargar(); }, [cargar]);

  const filtradas = materias.filter(m => {
    const coincideBusqueda = m.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCarrera = !filtroCarrera || m.carrera === filtroCarrera ||
      carreras.find(c => String(c.id) === filtroCarrera)?.nombre === m.carrera;
    return coincideBusqueda && coincideCarrera;
  });

  const abrirCrear = () => { setForm({ nombre: '', carreraId: '' }); setErrores({}); setModal('crear'); };
  const abrirEditar = (m) => {
    const carrera = carreras.find(c => c.nombre === m.carrera);
    setSeleccionada(m);
    setForm({ nombre: m.nombre, carreraId: carrera ? String(carrera.id) : '' });
    setErrores({});
    setModal('editar');
  };
  const abrirEliminar = (m) => { setSeleccionada(m); setModal('eliminar'); };

  const validar = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio';
    if (!form.carreraId) e.carreraId = 'Selecciona una carrera';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const handleGuardar = async () => {
    if (!validar()) return;
    setGuardando(true);
    try {
      const datos = { nombre: form.nombre.trim(), carreraId: Number(form.carreraId) };
      if (modal === 'crear') {
        await crearMateria(datos);
        mostrarToast('Materia creada correctamente ✓', 'exito');
      } else {
        await editarMateria(seleccionada.id, datos);
        mostrarToast('Materia actualizada correctamente ✓', 'exito');
      }
      setModal(null);
      cargar();
    } catch (e) {
      mostrarToast(e.message, 'error');
    } finally { setGuardando(false); }
  };

  const handleEliminar = async () => {
    setGuardando(true);
    try {
      await eliminarMateria(seleccionada.id);
      mostrarToast('Materia eliminada correctamente ✓', 'exito');
      setModal(null);
      cargar();
    } catch (e) {
      mostrarToast(e.message, 'error');
    } finally { setGuardando(false); }
  };

  // Agrupar por carrera para mostrar
  const porCarrera = filtradas.reduce((acc, m) => {
    const key = m.carrera || 'Sin carrera';
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: C.gris400, fontSize: 14 }}>🔍</span>
          <input type="text" placeholder="Buscar materia…" value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{
              width: '100%', padding: '9px 12px 9px 32px', borderRadius: 8,
              border: `1.5px solid ${C.gris200}`, fontSize: 13, color: C.gris900,
              fontFamily: '"DM Sans", sans-serif', background: C.gris50, outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={e => { e.target.style.borderColor = C.naranja; }}
            onBlur={e => { e.target.style.borderColor = C.gris200; }}
          />
        </div>
        <select value={filtroCarrera} onChange={e => setFiltroCarrera(e.target.value)}
          style={{
            padding: '9px 32px 9px 12px', borderRadius: 8, border: `1.5px solid ${C.gris200}`,
            fontSize: 13, fontFamily: '"DM Sans", sans-serif', color: filtroCarrera ? C.gris900 : C.gris400,
            background: C.gris50, outline: 'none', cursor: 'pointer', appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B6860' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
          }}>
          <option value="">Todas las carreras</option>
          {carreras.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
        <span style={{ fontSize: 12, color: C.gris400, fontFamily: '"DM Sans", sans-serif' }}>
          {filtradas.length} resultado{filtradas.length !== 1 ? 's' : ''}
        </span>
        {puedeEditar && (
          <Btn variante="primario" onClick={abrirCrear}>+ Nueva materia</Btn>
        )}
      </div>

      {/* Lista agrupada */}
      {cargando ? (
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
          {[...Array(4)].map((_, i) => <Skeleton key={i} />)}
        </div>
      ) : filtradas.length === 0 ? (
        <EstadoVacio
          icono="📚"
          titulo={busqueda || filtroCarrera ? 'Sin resultados' : 'No hay materias registradas'}
          descripcion={puedeEditar && !busqueda && !filtroCarrera ? 'Crea la primera materia para comenzar.' : 'Prueba con otros filtros.'}
        />
      ) : (
        Object.entries(porCarrera).map(([carreraNombre, items]) => (
          <div key={carreraNombre} style={{ marginBottom: 24 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12,
            }}>
              <span style={{
                padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                background: C.naranjaClaro, color: C.naranja,
                fontFamily: '"DM Sans", sans-serif', letterSpacing: '0.03em',
              }}>🎓 {carreraNombre}</span>
              <div style={{ flex: 1, height: 1, background: C.gris200 }} />
              <span style={{ fontSize: 11, color: C.gris400, fontFamily: '"DM Sans", sans-serif' }}>
                {items.length} materia{items.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
              {items.map(m => (
                <TarjetaMateria key={m.id} materia={m} puedeEditar={puedeEditar}
                  onEditar={abrirEditar} onEliminar={abrirEliminar} />
              ))}
            </div>
          </div>
        ))
      )}

      {/* Modales */}
      {(modal === 'crear' || modal === 'editar') && (
        <Modal
          titulo={modal === 'crear' ? 'Nueva materia' : 'Editar materia'}
          subtitulo={modal === 'editar' ? `Modificando: ${seleccionada?.nombre}` : undefined}
          onClose={() => setModal(null)}
        >
          <Input label="Nombre de la materia" value={form.nombre}
            onChange={v => setForm(f => ({ ...f, nombre: v }))}
            placeholder="Ej: Cálculo Diferencial" error={errores.nombre} />
          <Select label="Carrera" value={form.carreraId}
            onChange={v => setForm(f => ({ ...f, carreraId: v }))}
            placeholder="Seleccionar carrera…" error={errores.carreraId}
            options={carreras.map(c => ({ value: c.id, label: c.nombre }))} />
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <Btn variante="neutro" onClick={() => setModal(null)} full>Cancelar</Btn>
            <Btn variante="primario" onClick={handleGuardar} disabled={guardando} full>
              {guardando ? 'Guardando…' : modal === 'crear' ? '✓ Crear materia' : '✓ Guardar cambios'}
            </Btn>
          </div>
        </Modal>
      )}
      {modal === 'eliminar' && (
        <ModalEliminar
          titulo={`¿Eliminar "${seleccionada?.nombre}"?`}
          descripcion="Solo se puede eliminar si la materia no tiene cursos asociados."
          onConfirmar={handleEliminar} onCerrar={() => setModal(null)} cargando={guardando}
        />
      )}
    </div>
  );
}

function TarjetaMateria({ materia, puedeEditar, onEditar, onEliminar }) {
  const [hover, setHover] = useState(false);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: C.blanco, border: `1.5px solid ${hover ? C.azul : C.gris200}`,
        borderRadius: 12, padding: '14px 16px',
        boxShadow: hover ? sombraMedia : sombra,
        transform: hover ? 'translateY(-2px)' : 'none',
        transition: 'all 0.18s ease',
      }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{
          width: 32, height: 32, borderRadius: 8, background: C.azulClaro,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
        }}>📖</span>
        <span style={{ fontSize: 11, color: C.gris400, fontFamily: '"DM Sans", sans-serif' }}>#{materia.id}</span>
      </div>
      <p style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: C.gris900, fontFamily: '"DM Sans", sans-serif' }}>
        {materia.nombre}
      </p>
      {puedeEditar && (
        <div style={{ borderTop: `1px solid ${C.gris200}`, paddingTop: 10, display: 'flex', gap: 6 }}>
          <Btn variante="neutro" small full onClick={() => onEditar(materia)}>✏️ Editar</Btn>
          <Btn variante="peligro" small full onClick={() => onEliminar(materia)}>🗑</Btn>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// ─── TAB: CURSOS ──────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════
function TabCursos({ puedeEditar, mostrarToast }) {
  const [cursos, setCursos] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [modal, setModal] = useState(null);
  const [seleccionado, setSeleccionado] = useState(null);
  const [form, setForm] = useState({ materiaId: '', docenteId: '', cupoMaximo: '' });
  const [errores, setErrores] = useState({});

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const [c, m, d] = await Promise.allSettled([getCursos(), getMaterias(), getDocentes()]);
      if (c.status === 'fulfilled') setCursos(c.value);
      if (m.status === 'fulfilled') setMaterias(m.value);
      if (d.status === 'fulfilled') setDocentes(d.value);
      const err = [c, m, d].find(p => p.status === 'rejected');
      if (err) mostrarToast(err.reason.message, 'error');
    } finally { setCargando(false); }
  }, [mostrarToast]);

  useEffect(() => { cargar(); }, [cargar]);

  const filtrados = cursos.filter(c =>
    c.materia?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.docente?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const abrirCrear = () => { setForm({ materiaId: '', docenteId: '', cupoMaximo: '' }); setErrores({}); setModal('crear'); };
  const abrirEditar = (c) => {
    const materia = materias.find(m => m.nombre === c.materia);
    const docente = docentes.find(d => d.nombre === c.docente || `${d.nombre}` === c.docente);
    setSeleccionado(c);
    setForm({
      materiaId: materia ? String(materia.id) : '',
      docenteId: docente ? String(docente.id) : '',
      cupoMaximo: String(c.cupoMaximo),
    });
    setErrores({});
    setModal('editar');
  };
  const abrirEliminar = (c) => { setSeleccionado(c); setModal('eliminar'); };

  const validar = () => {
    const e = {};
    if (!form.materiaId) e.materiaId = 'Selecciona una materia';
    if (!form.docenteId) e.docenteId = 'Selecciona un docente';
    if (!form.cupoMaximo || Number(form.cupoMaximo) <= 0) e.cupoMaximo = 'El cupo debe ser mayor a 0';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const handleGuardar = async () => {
    if (!validar()) return;
    setGuardando(true);
    try {
      const datos = {
        materiaId: Number(form.materiaId),
        docenteId: Number(form.docenteId),
        cupoMaximo: Number(form.cupoMaximo),
      };
      if (modal === 'crear') {
        await crearCurso(datos);
        mostrarToast('Curso creado correctamente ✓', 'exito');
      } else {
        await editarCurso(seleccionado.id, datos);
        mostrarToast('Curso actualizado correctamente ✓', 'exito');
      }
      setModal(null);
      cargar();
    } catch (e) {
      mostrarToast(e.message, 'error');
    } finally { setGuardando(false); }
  };

  const handleEliminar = async () => {
    setGuardando(true);
    try {
      await eliminarCurso(seleccionado.id);
      mostrarToast('Curso eliminado correctamente ✓', 'exito');
      setModal(null);
      cargar();
    } catch (e) {
      mostrarToast(e.message, 'error');
    } finally { setGuardando(false); }
  };

  const estadoConfig = {
    'Sin asignar': { color: C.gris600, bg: C.gris100, icono: '⏸' },
    'Pendiente':   { color: C.amarillo, bg: C.amarilloClaro, icono: '⏳' },
    'Aprobado':    { color: C.verde, bg: C.verdeClaro, icono: '✅' },
    'Rechazado':   { color: C.rojo, bg: C.rojoClaro, icono: '❌' },
  };

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 220px' }}>
          <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: C.gris400, fontSize: 14 }}>🔍</span>
          <input type="text" placeholder="Buscar por materia o docente…" value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{
              width: '100%', padding: '9px 12px 9px 32px', borderRadius: 8,
              border: `1.5px solid ${C.gris200}`, fontSize: 13, color: C.gris900,
              fontFamily: '"DM Sans", sans-serif', background: C.gris50, outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={e => { e.target.style.borderColor = C.naranja; }}
            onBlur={e => { e.target.style.borderColor = C.gris200; }}
          />
        </div>
        <span style={{ fontSize: 12, color: C.gris400, fontFamily: '"DM Sans", sans-serif' }}>
          {filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''}
        </span>
        {puedeEditar && (
          <Btn variante="primario" onClick={abrirCrear}>+ Nuevo curso</Btn>
        )}
      </div>

      {/* Grid */}
      {cargando ? (
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {[...Array(4)].map((_, i) => <Skeleton key={i} />)}
        </div>
      ) : filtrados.length === 0 ? (
        <EstadoVacio
          icono="📋"
          titulo={busqueda ? 'Sin resultados' : 'No hay cursos registrados'}
          descripcion={puedeEditar && !busqueda ? 'Crea el primer curso para comenzar.' : 'Prueba con otro término.'}
        />
      ) : (
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {filtrados.map(c => {
            const cfg = estadoConfig[c.salonAsignado] || estadoConfig['Sin asignar'];
            return (
              <TarjetaCurso key={c.id} curso={c} cfg={cfg} puedeEditar={puedeEditar}
                onEditar={abrirEditar} onEliminar={abrirEliminar} />
            );
          })}
        </div>
      )}

      {/* Modales */}
      {(modal === 'crear' || modal === 'editar') && (
        <Modal
          titulo={modal === 'crear' ? 'Nuevo curso' : 'Editar curso'}
          subtitulo={modal === 'editar' ? `Modificando: ${seleccionado?.materia}` : undefined}
          onClose={() => setModal(null)}
        >
          <Select label="Materia" value={form.materiaId}
            onChange={v => setForm(f => ({ ...f, materiaId: v }))}
            placeholder="Seleccionar materia…" error={errores.materiaId}
            options={materias.map(m => ({ value: m.id, label: `${m.nombre} — ${m.carrera}` }))} />
          <Select label="Docente" value={form.docenteId}
            onChange={v => setForm(f => ({ ...f, docenteId: v }))}
            placeholder="Seleccionar docente…" error={errores.docenteId}
            options={docentes.map(d => ({ value: d.id, label: d.nombre || d.usuario?.nombre || `Docente #${d.id}` }))} />
          <Input label="Cupo máximo" value={form.cupoMaximo} type="number"
            onChange={v => setForm(f => ({ ...f, cupoMaximo: v }))}
            placeholder="Ej: 30" error={errores.cupoMaximo} />
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <Btn variante="neutro" onClick={() => setModal(null)} full>Cancelar</Btn>
            <Btn variante="primario" onClick={handleGuardar} disabled={guardando} full>
              {guardando ? 'Guardando…' : modal === 'crear' ? '✓ Crear curso' : '✓ Guardar cambios'}
            </Btn>
          </div>
        </Modal>
      )}
      {modal === 'eliminar' && (
        <ModalEliminar
          titulo={`¿Eliminar "${seleccionado?.materia}"?`}
          descripcion="Solo se puede eliminar si el curso no tiene asignaciones ni matrículas activas."
          onConfirmar={handleEliminar} onCerrar={() => setModal(null)} cargando={guardando}
        />
      )}
    </div>
  );
}

function TarjetaCurso({ curso, cfg, puedeEditar, onEditar, onEliminar }) {
  const [hover, setHover] = useState(false);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: C.blanco, border: `1.5px solid ${hover ? C.naranja : C.gris200}`,
        borderRadius: 12, padding: '16px 18px',
        boxShadow: hover ? sombraMedia : sombra,
        transform: hover ? 'translateY(-2px)' : 'none',
        transition: 'all 0.18s ease',
      }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          background: cfg.bg, color: cfg.color,
          border: `1px solid ${cfg.color}30`,
          padding: '3px 10px', borderRadius: 20,
          fontSize: 11, fontWeight: 700, fontFamily: '"DM Sans", sans-serif',
        }}>{cfg.icono} {curso.salonAsignado}</span>
        <span style={{ fontSize: 11, color: C.gris400, fontFamily: '"DM Sans", sans-serif' }}>#{curso.id}</span>
      </div>
      <p style={{ margin: '0 0 3px', fontSize: 15, fontWeight: 800, color: C.gris900, fontFamily: '"DM Sans", sans-serif' }}>
        {curso.materia}
      </p>
      <p style={{ margin: '0 0 3px', fontSize: 12, color: C.gris400, fontFamily: '"DM Sans", sans-serif' }}>
        👨‍🏫 {curso.docente}
      </p>
      <p style={{ margin: '0 0 12px', fontSize: 12, color: C.gris600, fontFamily: '"DM Sans", sans-serif' }}>
        👥 Cupo: {curso.cupoMaximo} estudiantes
      </p>
      {puedeEditar && (
        <div style={{ borderTop: `1px solid ${C.gris200}`, paddingTop: 10, display: 'flex', gap: 6 }}>
          <Btn variante="neutro" small full onClick={() => onEditar(curso)}>✏️ Editar</Btn>
          <Btn variante="peligro" small full onClick={() => onEliminar(curso)}>🗑 Eliminar</Btn>
        </div>
      )}
    </div>
  );
}

// ─── Estado vacío ──────────────────────────────────────────────────────────
function EstadoVacio({ icono, titulo, descripcion }) {
  return (
    <div style={{
      textAlign: 'center', padding: '60px 24px',
      background: C.blanco, borderRadius: 14, border: `1.5px dashed ${C.gris200}`,
    }}>
      <p style={{ fontSize: 38, margin: '0 0 10px' }}>{icono}</p>
      <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.gris900, fontFamily: '"DM Sans", sans-serif' }}>{titulo}</p>
      <p style={{ margin: '6px 0 0', fontSize: 13, color: C.gris400, fontFamily: '"DM Sans", sans-serif' }}>{descripcion}</p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════
export default function GestionCarrerasCursos() {
  const navigate = useNavigate();
  const [tabActivo, setTabActivo] = useState('carreras');
  const [toast, setToast] = useState({ msg: '', tipo: 'info' });

  const rol = getRolDesdeToken();
  const puedeEditar = ROLES_ESCRITURA.includes(rol);

  const mostrarToast = useCallback((msg, tipo = 'info') => setToast({ msg, tipo }), []);

  const TABS = [
    { id: 'carreras', label: '🎓 Carreras',  color: C.naranja },
    { id: 'materias', label: '📚 Materias',  color: C.azul },
    { id: 'cursos',   label: '📋 Cursos',    color: C.morado },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap');
        @keyframes slideUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes popIn   { from{opacity:0;transform:scale(0.96)}      to{opacity:1;transform:scale(1)}      }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.4} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.gris200}; border-radius: 99px; }
      `}</style>

      <div style={{ minHeight: '100vh', background: C.gris100, fontFamily: '"DM Sans", sans-serif', padding: '32px 24px' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>

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
                  }}>🎓</div>
                  <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: C.gris900 }}>
                    Carreras y Cursos
                  </h1>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: C.gris400 }}>
                  Gestión académica — carreras, materias y cursos
                </p>
              </div>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div style={{
            background: C.blanco, border: `1.5px solid ${C.gris200}`,
            borderRadius: 12, padding: '4px', marginBottom: 24,
            display: 'inline-flex', gap: 2, boxShadow: sombra,
          }}>
            {TABS.map(tab => {
              const activo = tabActivo === tab.id;
              return (
                <button key={tab.id} onClick={() => setTabActivo(tab.id)}
                  style={{
                    padding: '9px 22px', borderRadius: 9, border: 'none',
                    background: activo ? tab.color : 'transparent',
                    color: activo ? C.blanco : C.gris600,
                    fontSize: 14, fontWeight: 700, fontFamily: '"DM Sans", sans-serif',
                    cursor: 'pointer', transition: 'all 0.16s',
                  }}>
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ── Contenido del tab activo ── */}
          <div style={{
            background: C.blanco, border: `1.5px solid ${C.gris200}`,
            borderRadius: 14, padding: '24px', boxShadow: sombra,
          }}>
            {tabActivo === 'carreras' && <TabCarreras puedeEditar={puedeEditar} mostrarToast={mostrarToast} />}
            {tabActivo === 'materias' && <TabMaterias puedeEditar={puedeEditar} mostrarToast={mostrarToast} />}
            {tabActivo === 'cursos'   && <TabCursos   puedeEditar={puedeEditar} mostrarToast={mostrarToast} />}
          </div>

        </div>
      </div>

      <Toast msg={toast.msg} tipo={toast.tipo} onClose={() => setToast({ msg: '', tipo: 'info' })} />
    </>
  );
}