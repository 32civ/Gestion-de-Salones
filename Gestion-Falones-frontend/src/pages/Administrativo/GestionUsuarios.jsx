import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getUsuarios, crearUsuario, editarUsuario,
  cambiarPassword, activarUsuario, desactivarUsuario, eliminarUsuario, 
  getCarreras,
} from '../../api/usuariosApi';

import { asignarCarrera } from '../../api/estudiantesApi';

// ─── Diseño ────────────────────────────────────────────────────────────────
const C = {
  naranja:       '#E8611A', naranjaOsc:    '#C4511A', naranjaClaro:  '#FFF0E6',
  blanco:        '#FFFFFF', gris50:        '#FAFAF9', gris100:       '#F5F4F2',
  gris200:       '#E8E6E1', gris400:       '#B0ADA6', gris600:       '#6B6860',
  gris900:       '#1C1917', verde:         '#16A34A', verdeClaro:    '#DCFCE7',
  rojo:          '#DC2626', rojoClaro:     '#FEE2E2', azul:          '#2563EB',
  azulClaro:     '#DBEAFE', morado:        '#7C3AED', moradoClaro:   '#EDE9FE',
  amarillo:      '#D97706', amarilloClaro: '#FEF3C7', cyan:          '#0891B2',
  cyanClaro:     '#CFFAFE',
};
const sombra       = '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05)';
const sombraMedia  = '0 4px 12px rgba(0,0,0,0.09), 0 2px 4px rgba(0,0,0,0.06)';
const sombraGrande = '0 12px 30px rgba(0,0,0,0.13), 0 4px 10px rgba(0,0,0,0.08)';

const ROLES = ['Administrador', 'Administrativo', 'Docente', 'Estudiante'];


const ROL_CONFIG = {
  Administrador:  { color: C.morado,   bg: C.moradoClaro,   icono: '👑' },
  Administrativo: { color: C.azul,     bg: C.azulClaro,     icono: '🗂️' },
  Docente:        { color: C.naranja,  bg: C.naranjaClaro,  icono: '👨‍🏫' },
  Estudiante:     { color: C.verde,    bg: C.verdeClaro,    icono: '🎓' },
};

const getRolDesdeToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return '';
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role || '';
  } catch { return ''; }
};

const getIniciales = (nombre = '') =>
  nombre.split(' ').slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('');

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
      animation: 'slideUp 0.22s ease', maxWidth: 360,
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
function Modal({ titulo, subtitulo, ancho = 500, children, onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(28,25,23,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }} onClick={onClose}>
      <div style={{
        background: C.blanco, borderRadius: 16,
        width: '100%', maxWidth: ancho, boxShadow: sombraGrande,
        animation: 'popIn 0.18s ease', maxHeight: '92vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
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
    primario:   { bg: hov ? C.naranjaOsc : C.naranja,   color: C.blanco,  border: 'none' },
    secundario: { bg: hov ? C.naranjaClaro : C.blanco,   color: C.naranja, border: `1.5px solid ${C.naranja}` },
    peligro:    { bg: hov ? '#B91C1C' : C.rojo,          color: C.blanco,  border: 'none' },
    neutro:     { bg: hov ? C.gris200 : C.blanco,        color: C.gris600, border: `1.5px solid ${C.gris200}` },
    verde:      { bg: hov ? '#15803D' : C.verde,         color: C.blanco,  border: 'none' },
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
function Campo({ label, tipo = 'text', value, onChange, placeholder, error, disabled }) {
  const [show, setShow] = useState(false);
  const esPwd = tipo === 'password';
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{
        display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700,
        color: C.gris600, textTransform: 'uppercase', letterSpacing: '0.06em',
        fontFamily: '"DM Sans", sans-serif',
      }}>{label}</label>}
      <div style={{ position: 'relative' }}>
        <input
          type={esPwd && !show ? 'password' : 'text'}
          value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} disabled={disabled}
          style={{
            width: '100%', padding: esPwd ? '10px 40px 10px 13px' : '10px 13px',
            borderRadius: 8, boxSizing: 'border-box',
            border: `1.5px solid ${error ? C.rojo : C.gris200}`,
            fontSize: 14, fontFamily: '"DM Sans", sans-serif', color: C.gris900,
            background: disabled ? C.gris100 : (error ? C.rojoClaro : C.blanco),
            outline: 'none',
          }}
          onFocus={e => { e.target.style.borderColor = error ? C.rojo : C.naranja; }}
          onBlur={e => { e.target.style.borderColor = error ? C.rojo : C.gris200; }}
        />
        {esPwd && (
          <button type="button" onClick={() => setShow(!show)} style={{
            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: C.gris400,
          }}>{show ? '🙈' : '👁'}</button>
        )}
      </div>
      {error && <p style={{ margin: '4px 0 0', fontSize: 11, color: C.rojo, fontFamily: '"DM Sans", sans-serif' }}>{error}</p>}
    </div>
  );
}

// ─── Avatar ────────────────────────────────────────────────────────────────
function Avatar({ nombre, size = 38 }) {
  const iniciales = getIniciales(nombre);
  const hue = [...nombre].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `hsl(${hue}, 55%, 88%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 800, color: `hsl(${hue}, 55%, 35%)`,
      fontFamily: '"DM Sans", sans-serif',
    }}>{iniciales}</div>
  );
}

// ─── Chip de rol ───────────────────────────────────────────────────────────
function ChipRol({ rol }) {
  const cfg = ROL_CONFIG[rol] || { color: C.gris600, bg: C.gris200, icono: '👤' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.color}30`,
      padding: '2px 9px', borderRadius: 20,
      fontSize: 11, fontWeight: 700, fontFamily: '"DM Sans", sans-serif',
    }}>{cfg.icono} {rol}</span>
  );
}

// ─── Modal: Crear usuario ──────────────────────────────────────────────────
function ModalCrear({ onGuardar, onCerrar, cargando }) {
  const [paso,     setPaso]     = useState(1); // 1 = datos, 2 = carrera
  const [nombre,   setNombre]   = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [rol,      setRol]      = useState('');
  const [carreraId,setCarreraId]= useState('');
  const [carreras, setCarreras] = useState([]);
  const [loadingCar, setLoadingCar] = useState(false);
  const [errores,  setErrores]  = useState({});

  const validarPaso1 = () => {
    const e = {};
    if (!nombre.trim())           e.nombre   = 'El nombre es obligatorio';
    if (!email.trim())            e.email    = 'El email es obligatorio';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Email inválido';
    if (!password)                e.password = 'La contraseña es obligatoria';
    else if (password.length < 6) e.password = 'Mínimo 6 caracteres';
    if (!rol)                     e.rol      = 'Selecciona un rol';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const irAPaso2 = () => {
    if (!validarPaso1()) return;
    if (rol === 'Estudiante') {
      setLoadingCar(true);
      getCarreras()
        .then(data => setCarreras(data))
        .catch(() => {})
        .finally(() => setLoadingCar(false));
      setPaso(2);
    } else {
      onGuardar({ nombre, email, password, rol });
    }
  };

  return (
    <Modal
      titulo={paso === 1 ? 'Nuevo usuario' : 'Asignar carrera'}
      subtitulo={paso === 1
        ? 'Completa los datos para crear la cuenta'
        : `Selecciona la carrera para ${nombre}`}
      onClose={onCerrar}
    >
      {/* ── Indicador de pasos (solo si es Estudiante) ── */}
      {rol === 'Estudiante' && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, alignItems: 'center' }}>
          {['Datos', 'Carrera'].map((label, i) => {
            const activo = paso === i + 1;
            const completado = paso > i + 1;
            return (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: completado ? C.verde : activo ? C.naranja : C.gris200,
                  color: completado || activo ? C.blanco : C.gris400,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 800, fontFamily: '"DM Sans", sans-serif',
                  flexShrink: 0,
                }}>
                  {completado ? '✓' : i + 1}
                </div>
                <span style={{
                  fontSize: 12, fontWeight: activo ? 700 : 400,
                  color: activo ? C.naranja : C.gris400,
                  fontFamily: '"DM Sans", sans-serif',
                }}>{label}</span>
                {i < 1 && <div style={{ width: 24, height: 1, background: C.gris200 }} />}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Paso 1: Datos del usuario ── */}
      {paso === 1 && (
        <>
          <Campo label="Nombre completo" value={nombre} onChange={setNombre} placeholder="Ej: Pepito Pérez" error={errores.nombre} />
          <Campo label="Email" value={email} onChange={setEmail} placeholder="correo@algo.edu" error={errores.email} />
          <Campo label="Contraseña" tipo="password" value={password} onChange={setPassword} placeholder="Mínimo 6 caracteres" error={errores.password} />

          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block', marginBottom: 8, fontSize: 12, fontWeight: 700,
              color: C.gris600, textTransform: 'uppercase', letterSpacing: '0.06em',
              fontFamily: '"DM Sans", sans-serif',
            }}>Rol</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {ROLES.map(r => {
                const cfg = ROL_CONFIG[r];
                const sel = rol === r;
                return (
                  <button key={r} onClick={() => setRol(r)} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '7px 14px', borderRadius: 9, cursor: 'pointer',
                    border: `1.5px solid ${sel ? cfg.color : C.gris200}`,
                    background: sel ? cfg.bg : C.blanco,
                    color: sel ? cfg.color : C.gris600,
                    fontSize: 13, fontWeight: 700, fontFamily: '"DM Sans", sans-serif',
                    transition: 'all 0.14s',
                  }}>
                    {cfg.icono} {r}
                  </button>
                );
              })}
            </div>
            {errores.rol && <p style={{ margin: '6px 0 0', fontSize: 11, color: C.rojo, fontFamily: '"DM Sans", sans-serif' }}>{errores.rol}</p>}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Btn variante="neutro" onClick={onCerrar} full>Cancelar</Btn>
            <Btn variante="primario" disabled={cargando} full onClick={irAPaso2}>
              {rol === 'Estudiante' ? 'Siguiente →' : (cargando ? 'Creando…' : '＋ Crear usuario')}
            </Btn>
          </div>
        </>
      )}

      {/* ── Paso 2: Asignar carrera (solo Estudiante) ── */}
      {paso === 2 && (
        <>
          {loadingCar ? (
            <p style={{ textAlign: 'center', color: C.gris400, fontSize: 13, padding: '1rem 0' }}>
              Cargando carreras...
            </p>
          ) : (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 260, overflowY: 'auto' }}>
                {carreras.map(c => (
                  <button key={c.id} onClick={() => setCarreraId(c.id)} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', borderRadius: 9, cursor: 'pointer',
                    border: `1.5px solid ${carreraId === c.id ? C.naranja : C.gris200}`,
                    background: carreraId === c.id ? C.naranjaClaro : C.blanco,
                    color: carreraId === c.id ? C.naranja : C.gris600,
                    fontSize: 13, fontWeight: 600, fontFamily: '"DM Sans", sans-serif',
                    transition: 'all 0.14s', textAlign: 'left',
                  }}>
                    <span>🎓 {c.nombre}</span>
                    {carreraId === c.id && <span style={{ fontSize: 16 }}>✓</span>}
                  </button>
                ))}
              </div>

              {/* Aviso opcional — puede saltarse */}
              <p style={{ margin: '10px 0 0', fontSize: 11, color: C.gris400, fontFamily: '"DM Sans", sans-serif' }}>
                Puedes omitir este paso y asignar la carrera después desde la tarjeta del usuario.
              </p>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <Btn variante="neutro" onClick={() => setPaso(1)} full>← Volver</Btn>
            <Btn variante="neutro" onClick={() => onGuardar({ nombre, email, password, rol })} full>
              Omitir
            </Btn>
            <Btn
              variante="primario" full
              disabled={cargando || !carreraId}
              onClick={() => onGuardar({ nombre, email, password, rol, carreraId })}
            >
              {cargando ? 'Creando…' : '＋ Crear con carrera'}
            </Btn>
          </div>
        </>
      )}
    </Modal>
  );
}

// ─── Modal: Editar usuario ─────────────────────────────────────────────────
function ModalEditar({ usuario, onGuardar, onCerrar, cargando }) {
  const [nombre,  setNombre]  = useState(usuario.nombre);
  const [email,   setEmail]   = useState(usuario.email);
  const [errores, setErrores] = useState({});

  const validar = () => {
    const e = {};
    if (!nombre.trim()) e.nombre = 'El nombre es obligatorio';
    if (!email.trim())  e.email  = 'El email es obligatorio';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Email inválido';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  return (
    <Modal titulo="Editar usuario" subtitulo={`Modificando datos de ${usuario.nombre}`} onClose={onCerrar}>
      <Campo label="Nombre completo" value={nombre} onChange={setNombre} placeholder="Nombre completo" error={errores.nombre} />
      <Campo label="Email" value={email} onChange={setEmail} placeholder="correo@institución.edu" error={errores.email} />
      <div style={{ display: 'flex', gap: 10 }}>
        <Btn variante="neutro" onClick={onCerrar} full>Cancelar</Btn>
        <Btn variante="primario" disabled={cargando} full
          onClick={() => { if (validar()) onGuardar({ nombre, email }); }}
        >{cargando ? 'Guardando…' : 'Guardar cambios'}</Btn>
      </div>
    </Modal>
  );
}

// ─── Modal: Cambiar contraseña ─────────────────────────────────────────────
function ModalPassword({ usuario, onGuardar, onCerrar, cargando }) {
  const [pwd,     setPwd]     = useState('');
  const [confirm, setConfirm] = useState('');
  const [errores, setErrores] = useState({});

  const validar = () => {
    const e = {};
    if (!pwd || pwd.length < 6) e.pwd = 'Mínimo 6 caracteres';
    if (pwd !== confirm)        e.confirm = 'Las contraseñas no coinciden';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  return (
    <Modal titulo="Cambiar contraseña" subtitulo={`Cambiando contraseña de ${usuario.nombre}`} onClose={onCerrar}>
      <div style={{
        background: C.amarilloClaro, border: `1px solid ${C.amarillo}40`,
        borderRadius: 10, padding: '10px 14px', marginBottom: 18,
        display: 'flex', gap: 8,
      }}>
        <span>⚠️</span>
        <p style={{ margin: 0, fontSize: 12, color: '#92400E', fontFamily: '"DM Sans", sans-serif' }}>
          El usuario deberá usar la nueva contraseña en su próximo inicio de sesión.
        </p>
      </div>
      <Campo label="Nueva contraseña" tipo="password" value={pwd} onChange={setPwd} placeholder="Mínimo 6 caracteres" error={errores.pwd} />
      <Campo label="Confirmar contraseña" tipo="password" value={confirm} onChange={setConfirm} placeholder="Repetir contraseña" error={errores.confirm} />
      <div style={{ display: 'flex', gap: 10 }}>
        <Btn variante="neutro" onClick={onCerrar} full>Cancelar</Btn>
        <Btn variante="primario" disabled={cargando} full
          onClick={() => { if (validar()) onGuardar(pwd); }}
        >{cargando ? 'Guardando…' : '🔑 Cambiar contraseña'}</Btn>
      </div>
    </Modal>
  );
}

// ─── Modal: Confirmar eliminar ─────────────────────────────────────────────
function ModalEliminar({ usuario, onConfirmar, onCerrar, cargando }) {
  return (
    <Modal titulo="Eliminar usuario" onClose={onCerrar}>
      <div style={{
        background: C.rojoClaro, border: `1px solid #FECACA`,
        borderRadius: 10, padding: '14px 16px', marginBottom: 20,
        display: 'flex', gap: 10,
      }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
        <p style={{ margin: 0, fontSize: 14, color: '#7F1D1D', fontFamily: '"DM Sans", sans-serif', lineHeight: 1.6 }}>
          ¿Eliminar a <strong>{usuario.nombre}</strong>? Esta acción es irreversible.
          No se pueden eliminar administradores.
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

// ─── Modal: Detalle de usuario ─────────────────────────────────────────────
function ModalDetalle({ usuario, onCerrar, onEditar, onPassword, onActivar, onDesactivar, onEliminar, rolActual, onCarrera }) {
  const esAdmin = rolActual === 'Administrador';
  const puedeEliminar = !usuario.roles?.includes('Administrador');

  return (
    <Modal titulo="Detalle del usuario" onClose={onCerrar}>
      {/* Cabecera */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        background: C.gris50, borderRadius: 12, padding: '16px 18px', marginBottom: 20,
      }}>
        <Avatar nombre={usuario.nombre} size={52} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: C.gris900, fontFamily: '"DM Sans", sans-serif' }}>
            {usuario.nombre}
          </p>
          <p style={{ margin: '2px 0 6px', fontSize: 13, color: C.gris400, fontFamily: '"DM Sans", sans-serif' }}>
            {usuario.email}
          </p>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {(usuario.roles || []).map(r => <ChipRol key={r} rol={r} />)}
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: usuario.activo ? C.verdeClaro : C.rojoClaro,
              color: usuario.activo ? C.verde : C.rojo,
              border: `1px solid ${usuario.activo ? C.verde : C.rojo}30`,
              padding: '2px 9px', borderRadius: 20,
              fontSize: 11, fontWeight: 700, fontFamily: '"DM Sans", sans-serif',
            }}>
              {usuario.activo ? '● Activo' : '● Inactivo'}
            </span>
          </div>
        </div>
      </div>

      {/* Info */}
      {[
        { label: 'ID', valor: `#${usuario.id}` },
        { label: 'Email', valor: usuario.email },
        { label: 'Estado', valor: usuario.activo ? 'Activo' : 'Inactivo' },
        { label: 'Roles', valor: (usuario.roles || []).join(', ') || '—' },
      ].map(({ label, valor }) => (
        <div key={label} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '9px 0', borderBottom: `1px solid ${C.gris200}`,
          fontFamily: '"DM Sans", sans-serif',
        }}>
          <span style={{ fontSize: 12, color: C.gris400, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
          <span style={{ fontSize: 14, color: C.gris900, fontWeight: 700 }}>{valor}</span>
        </div>
      ))}

      {/* Acciones */}
      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', gap: 8 }}>

          {(usuario.roles || []).includes('Estudiante') && (
          <Btn variante="secundario" full onClick={() => { onCerrar(); onCarrera(usuario); }}>
            🎓 Asignar carrera
          </Btn>)}

          <Btn variante="secundario" full onClick={() => { onCerrar(); onEditar(usuario); }}>✏️ Editar datos</Btn>
          <Btn variante="neutro" full onClick={() => { onCerrar(); onPassword(usuario); }}>🔑 Contraseña</Btn>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {usuario.activo ? (
            <Btn variante="neutro" full onClick={() => { onCerrar(); onDesactivar(usuario); }}>⏸ Desactivar</Btn>
          ) : (
            <Btn variante="verde" full onClick={() => { onCerrar(); onActivar(usuario); }}>▶ Activar</Btn>
          )}
          {puedeEliminar && (
            <Btn variante="peligro" full onClick={() => { onCerrar(); onEliminar(usuario); }}>🗑️ Eliminar</Btn>
          )}
        </div>
        <Btn variante="neutro" full onClick={onCerrar}>Cerrar</Btn>
      </div>
    </Modal>
  );
}

// ─── Modal: Asignar Carrera ──────────────────────────────────────────────────

function ModalAsignarCarrera({ usuario, onGuardar, onCerrar, cargando }) {
  const [carreras,   setCarreras]   = useState([]);
  const [carreraId,  setCarreraId]  = useState('');
  const [loadingCar, setLoadingCar] = useState(true);
  const [error,      setError]      = useState(null);

  useEffect(() => {
    getCarreras()
      .then(data => setCarreras(data))
      .catch(e => setError(e.message))
      .finally(() => setLoadingCar(false));
  }, []);

  return (
    <Modal
      titulo="Asignar carrera"
      subtitulo={`Asignando carrera a ${usuario.nombre}`}
      onClose={onCerrar}
    >
      {loadingCar && (
        <p style={{ textAlign: 'center', color: C.gris400, fontSize: 13, padding: '1rem 0' }}>
          Cargando carreras...
        </p>
      )}

      {error && (
        <p style={{ color: C.rojo, fontSize: 13, marginBottom: 16 }}>{error}</p>
      )}

      {!loadingCar && !error && (
        <div style={{ marginBottom: 20 }}>
          <label style={{
            display: 'block', marginBottom: 8, fontSize: 12, fontWeight: 700,
            color: C.gris600, textTransform: 'uppercase', letterSpacing: '0.06em',
            fontFamily: '"DM Sans", sans-serif',
          }}>Carrera</label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 260, overflowY: 'auto' }}>
            {carreras.map(c => (
              <button key={c.id} onClick={() => setCarreraId(c.id)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', borderRadius: 9, cursor: 'pointer',
                border: `1.5px solid ${carreraId === c.id ? C.naranja : C.gris200}`,
                background: carreraId === c.id ? C.naranjaClaro : C.blanco,
                color: carreraId === c.id ? C.naranja : C.gris600,
                fontSize: 13, fontWeight: 600, fontFamily: '"DM Sans", sans-serif',
                transition: 'all 0.14s', textAlign: 'left',
              }}>
                <span>🎓 {c.nombre}</span>
                {carreraId === c.id && <span style={{ fontSize: 16 }}>✓</span>}
              </button>
            ))}
          </div>

          {!carreraId && (
            <p style={{ margin: '6px 0 0', fontSize: 11, color: C.rojo, fontFamily: '"DM Sans", sans-serif' }}>
              Selecciona una carrera
            </p>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <Btn variante="neutro" onClick={onCerrar} full>Cancelar</Btn>
        <Btn
          variante="primario" full
          disabled={cargando || !carreraId}
          onClick={() => carreraId && onGuardar(carreraId)}
        >
          {cargando ? 'Asignando…' : '🎓 Asignar carrera'}
        </Btn>
      </div>
    </Modal>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{ background: C.blanco, border: `1.5px solid ${C.gris200}`, borderRadius: 13, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 44, height: 44, borderRadius: '50%', background: C.gris200, flexShrink: 0, animation: 'pulse 1.4s ease-in-out infinite' }} />
      <div style={{ flex: 1 }}>
        {[70, 50].map((w, i) => (
          <div key={i} style={{ height: 12, width: `${w}%`, background: C.gris200, borderRadius: 6, marginBottom: 8, animation: 'pulse 1.4s ease-in-out infinite', animationDelay: `${i * 0.12}s` }} />
        ))}
      </div>
    </div>
  );
}

// ─── Tarjeta de usuario ────────────────────────────────────────────────────
function TarjetaUsuario({ usuario, onVer, onEditar, onPassword, onActivar, onDesactivar, onEliminar, onCarrera }) {
  const [hover, setHover] = useState(false);
  const puedeEliminar = !usuario.roles?.includes('Administrador');

  return (
    <div
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: C.blanco,
        border: `1.5px solid ${hover ? C.naranja : (usuario.activo ? C.gris200 : '#FECACA')}`,
        borderRadius: 13, padding: '16px 18px',
        boxShadow: hover ? sombraMedia : sombra,
        transform: hover ? 'translateY(-2px)' : 'none',
        transition: 'all 0.18s ease',
        display: 'flex', flexDirection: 'column', gap: 10,
        opacity: usuario.activo ? 1 : 0.75,
      }}
    >
      {/* Fila superior: avatar + nombre + estado */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar nombre={usuario.nombre} size={40} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.gris900, fontFamily: '"DM Sans", sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {usuario.nombre}
          </p>
          <p style={{ margin: 0, fontSize: 11, color: C.gris400, fontFamily: '"DM Sans", sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {usuario.email}
          </p>
        </div>
        <span style={{
          width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
          background: usuario.activo ? C.verde : C.rojo,
        }} title={usuario.activo ? 'Activo' : 'Inactivo'} />
      </div>

      {/* Roles */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, minHeight: 22 }}>
        {(usuario.roles || []).map(r => <ChipRol key={r} rol={r} />)}
      </div>

      {/* Carrera — solo si es estudiante */}
      {(usuario.roles || []).includes('Estudiante') && (
        <p style={{
          margin: 0, fontSize: 11, color: C.gris400,
          fontFamily: '"DM Sans", sans-serif',
          display: 'flex', alignItems: 'center', gap: 4
          }}>
          🎓 {usuario.carrera ?? 'Sin carrera asignada'}
        </p>
      )}

      {/* Acciones */}
      <div style={{ borderTop: `1px solid ${C.gris200}`, paddingTop: 10, display: 'flex', gap: 5, flexWrap: 'wrap' }}>

        <Btn variante="neutro" small onClick={() => onVer(usuario)}>👁</Btn>

        {(usuario.roles || []).includes('Estudiante') && (
        <Btn variante="neutro" small onClick={() => onCarrera(usuario)}>🎓</Btn>)}

        <Btn variante="secundario" small onClick={() => onEditar(usuario)}>✏️</Btn>
        <Btn variante="neutro" small onClick={() => onPassword(usuario)}>🔑</Btn>
        {usuario.activo
          ? <Btn variante="neutro" small onClick={() => onDesactivar(usuario)}>⏸</Btn>
          : <Btn variante="verde"  small onClick={() => onActivar(usuario)}>▶</Btn>
        }
        {puedeEliminar && (
          <Btn variante="peligro" small onClick={() => onEliminar(usuario)}>🗑️</Btn>
        )}
      </div>
    </div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────
export default function GestionUsuarios() {
  const navigate = useNavigate();

  const [usuarios,     setUsuarios]     = useState([]);
  const [usuarioCarrera,  setUsuarioCarrera]  = useState(null);
  const [cargando,     setCargando]     = useState(true);
  const [busqueda,     setBusqueda]     = useState('');
  const [filtroRol,    setFiltroRol]    = useState('Todos');
  const [filtroEstado, setFiltroEstado] = useState('Todos');

  const [modalCrear,   setModalCrear]   = useState(false);
  const [usuarioVer,   setUsuarioVer]   = useState(null);
  const [usuarioEditar,setUsuarioEditar]= useState(null);
  const [usuarioPwd,   setUsuarioPwd]   = useState(null);
  const [usuarioActivar,  setUsuarioActivar]   = useState(null);
  const [usuarioDesact,   setUsuarioDesact]     = useState(null);
  const [usuarioEliminar, setUsuarioEliminar]   = useState(null);

  const [guardando,    setGuardando]    = useState(false);
  const [toast,        setToast]        = useState({ msg: '', tipo: 'info' });

  const rolActual = getRolDesdeToken();
  const mostrarToast = useCallback((msg, tipo = 'info') => setToast({ msg, tipo }), []);

  const cargarUsuarios = useCallback(async () => {
    setCargando(true);
    try {
      const data = await getUsuarios();
      setUsuarios(data);
    } catch (e) {
      mostrarToast(e.message, 'error');
    } finally { setCargando(false); }
  }, [mostrarToast]);

  useEffect(() => { cargarUsuarios(); }, [cargarUsuarios]);

  // ── Filtrado ──
  const usuariosFiltrados = usuarios.filter(u => {
    const coincideBusqueda = !busqueda ||
      u.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.email?.toLowerCase().includes(busqueda.toLowerCase());
    const coincideRol    = filtroRol === 'Todos' || (u.roles || []).includes(filtroRol);
    const coincideEstado = filtroEstado === 'Todos' ||
      (filtroEstado === 'Activo' ? u.activo : !u.activo);
    return coincideBusqueda && coincideRol && coincideEstado;
  });

  // ── Handlers ──

  const handleAsignarCarrera = async (carreraId) => {
  setGuardando(true);
  try {
    // Buscar el estudianteId a partir del usuarioId
    const res = await fetch(
      `${import.meta.env.VITE_API_URL || 'https://localhost:7138'}/api/Estudiantes`,
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    );
    const estudiantes = await res.json();
    const estudiante = estudiantes.find(e => e.usuarioId === usuarioCarrera.id || e.nombre === usuarioCarrera.nombre);

    if (!estudiante) throw new Error("No se encontró el perfil de estudiante");

    await asignarCarrera(estudiante.id, carreraId);
    mostrarToast('Carrera asignada correctamente ✓', 'exito');
    setUsuarioCarrera(null);
  } catch (e) {
    mostrarToast(e.message, 'error');
  } finally {
    setGuardando(false);
  }
  };

  const handleCrear = async (dto) => {
  setGuardando(true);
  try {
    const resultado = await crearUsuario(dto);
    
    // Si es estudiante y viene carreraId, asignarla automáticamente
    if (dto.rol === 'Estudiante' && dto.carreraId) {
      // Recargar para obtener el estudianteId recién creado
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://localhost:7138'}/api/Estudiantes`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      const estudiantes = await res.json();
      const estudiante = estudiantes.find(e => e.nombre === dto.nombre);
      if (estudiante) {
        await asignarCarrera(estudiante.id, dto.carreraId);
      }
    }

    mostrarToast('Usuario creado correctamente ✓', 'exito');
    setModalCrear(false);
    cargarUsuarios();
  } catch (e) {
    mostrarToast(e.message, 'error');
  } finally {
    setGuardando(false);
  }
};

  const handleEditar = async (dto) => {
    setGuardando(true);
    try {
      await editarUsuario(usuarioEditar.id, dto);
      mostrarToast('Usuario actualizado correctamente ✓', 'exito');
      setUsuarioEditar(null);
      cargarUsuarios();
    } catch (e) { mostrarToast(e.message, 'error'); }
    finally { setGuardando(false); }
  };

  const handlePassword = async (pwd) => {
    setGuardando(true);
    try {
      await cambiarPassword(usuarioPwd.id, pwd);
      mostrarToast('Contraseña actualizada correctamente ✓', 'exito');
      setUsuarioPwd(null);
    } catch (e) { mostrarToast(e.message, 'error'); }
    finally { setGuardando(false); }
  };

  const handleActivar = async () => {
    setGuardando(true);
    try {
      await activarUsuario(usuarioActivar.id);
      mostrarToast(`${usuarioActivar.nombre} activado ✓`, 'exito');
      setUsuarioActivar(null);
      cargarUsuarios();
    } catch (e) { mostrarToast(e.message, 'error'); }
    finally { setGuardando(false); }
  };

  const handleDesactivar = async () => {
    setGuardando(true);
    try {
      await desactivarUsuario(usuarioDesact.id);
      mostrarToast(`${usuarioDesact.nombre} desactivado ✓`, 'exito');
      setUsuarioDesact(null);
      cargarUsuarios();
    } catch (e) { mostrarToast(e.message, 'error'); }
    finally { setGuardando(false); }
  };

  const handleEliminar = async () => {
    setGuardando(true);
    try {
      await eliminarUsuario(usuarioEliminar.id);
      mostrarToast('Usuario eliminado correctamente ✓', 'exito');
      setUsuarioEliminar(null);
      cargarUsuarios();
    } catch (e) { mostrarToast(e.message, 'error'); }
    finally { setGuardando(false); }
  };

  // ── Stats ──
  const stats = {
    total:    usuarios.length,
    activos:  usuarios.filter(u => u.activo).length,
    docentes: usuarios.filter(u => u.roles?.includes('Docente')).length,
    estudiantes: usuarios.filter(u => u.roles?.includes('Estudiante')).length,
  };

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
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: C.naranja, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>👥</div>
                  <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: C.gris900 }}>Gestión de Usuarios</h1>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: C.gris400 }}>{usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''} registrado{usuarios.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <Btn variante="primario" onClick={() => setModalCrear(true)}>＋ Nuevo usuario</Btn>
          </div>

          {/* ── Stats ── */}
          <div style={{ display: 'grid', gap: 12, marginBottom: 24, gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
            {[
              { icono: '👥', valor: stats.total,       label: 'Total',       color: C.naranja, bg: C.naranjaClaro },
              { icono: '✅', valor: stats.activos,      label: 'Activos',     color: C.verde,   bg: C.verdeClaro   },
              { icono: '👨‍🏫', valor: stats.docentes,    label: 'Docentes',    color: C.azul,    bg: C.azulClaro    },
              { icono: '🎓', valor: stats.estudiantes,  label: 'Estudiantes', color: C.morado,  bg: C.moradoClaro  },
            ].map(({ icono, valor, label, color, bg }) => (
              <div key={label} style={{
                background: bg, border: `1.5px solid ${color}25`,
                borderRadius: 12, padding: '14px 18px',
                display: 'flex', alignItems: 'center', gap: 10, boxShadow: sombra,
              }}>
                <span style={{ fontSize: 20 }}>{icono}</span>
                <div>
                  <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: C.gris900, fontFamily: '"DM Sans", sans-serif', lineHeight: 1 }}>{valor}</p>
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
              <input type="text" placeholder="Buscar por nombre o email…" value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                style={{ width: '100%', padding: '9px 12px 9px 32px', borderRadius: 8, border: `1.5px solid ${C.gris200}`, fontSize: 13, color: C.gris900, fontFamily: '"DM Sans", sans-serif', background: C.gris50, outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => { e.target.style.borderColor = C.naranja; }}
                onBlur={e => { e.target.style.borderColor = C.gris200; }}
              />
            </div>

            {/* Filtro rol */}
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {['Todos', ...ROLES].map(r => {
                const activo = filtroRol === r;
                const cfg = ROL_CONFIG[r] || { color: C.naranja, bg: C.naranjaClaro };
                return (
                  <button key={r} onClick={() => setFiltroRol(r)} style={{
                    padding: '5px 11px', borderRadius: 8, cursor: 'pointer',
                    border: `1.5px solid ${activo ? cfg.color : C.gris200}`,
                    background: activo ? cfg.bg : C.blanco,
                    color: activo ? cfg.color : C.gris600,
                    fontSize: 12, fontWeight: 700, fontFamily: '"DM Sans", sans-serif', transition: 'all 0.14s',
                  }}>{r}</button>
                );
              })}
            </div>

            {/* Filtro estado */}
            <div style={{ display: 'flex', gap: 5 }}>
              {['Todos', 'Activo', 'Inactivo'].map(e => {
                const activo = filtroEstado === e;
                return (
                  <button key={e} onClick={() => setFiltroEstado(e)} style={{
                    padding: '5px 11px', borderRadius: 8, cursor: 'pointer',
                    border: `1.5px solid ${activo ? C.naranja : C.gris200}`,
                    background: activo ? C.naranjaClaro : C.blanco,
                    color: activo ? C.naranja : C.gris600,
                    fontSize: 12, fontWeight: 700, fontFamily: '"DM Sans", sans-serif', transition: 'all 0.14s',
                  }}>{e}</button>
                );
              })}
            </div>

            <span style={{ marginLeft: 'auto', fontSize: 12, color: C.gris400, fontFamily: '"DM Sans", sans-serif' }}>
              {usuariosFiltrados.length} resultado{usuariosFiltrados.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* ── Grid ── */}
          {cargando ? (
            <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
              {[...Array(8)].map((_, i) => <Skeleton key={i} />)}
            </div>
          ) : usuariosFiltrados.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px', background: C.blanco, borderRadius: 14, border: `1.5px dashed ${C.gris200}` }}>
              <p style={{ fontSize: 38, margin: '0 0 10px' }}>👥</p>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.gris900 }}>
                {busqueda || filtroRol !== 'Todos' || filtroEstado !== 'Todos' ? 'Sin resultados' : 'No hay usuarios aún'}
              </p>
              <p style={{ margin: '6px 0 0', fontSize: 13, color: C.gris400 }}>
                {busqueda || filtroRol !== 'Todos' || filtroEstado !== 'Todos' ? 'Prueba con otros filtros.' : 'Crea el primer usuario con el botón de arriba.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
              {usuariosFiltrados.map(u => (
                <TarjetaUsuario
                  key={u.id} usuario={u}
                  onVer={setUsuarioVer}
                  onEditar={setUsuarioEditar}
                  onPassword={setUsuarioPwd}
                  onActivar={setUsuarioActivar}
                  onDesactivar={setUsuarioDesact}
                  onEliminar={setUsuarioEliminar}
                  onCarrera={setUsuarioCarrera}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Modales ── */}
      {modalCrear    && <ModalCrear onGuardar={handleCrear} onCerrar={() => setModalCrear(false)} cargando={guardando} />}
      {usuarioVer    && <ModalDetalle usuario={usuarioVer} rolActual={rolActual} onCerrar={() => setUsuarioVer(null)} onEditar={setUsuarioEditar} onPassword={setUsuarioPwd} onActivar={setUsuarioActivar} onDesactivar={setUsuarioDesact} onEliminar={setUsuarioEliminar} onCarrera={setUsuarioCarrera} />}
      {usuarioEditar && <ModalEditar usuario={usuarioEditar} onGuardar={handleEditar} onCerrar={() => setUsuarioEditar(null)} cargando={guardando} />}
      {usuarioPwd    && <ModalPassword usuario={usuarioPwd} onGuardar={handlePassword} onCerrar={() => setUsuarioPwd(null)} cargando={guardando} />}
      {usuarioEliminar && <ModalEliminar usuario={usuarioEliminar} onConfirmar={handleEliminar} onCerrar={() => setUsuarioEliminar(null)} cargando={guardando} />}
      {usuarioCarrera && <ModalAsignarCarrera usuario={usuarioCarrera} onGuardar={handleAsignarCarrera} onCerrar={() => setUsuarioCarrera(null)} cargando={guardando} /> }

      {/* Confirmaciones activar/desactivar inline */}
      {usuarioActivar && (
        <Modal titulo="Activar usuario" onClose={() => setUsuarioActivar(null)}>
          <p style={{ fontSize: 14, color: C.gris600, fontFamily: '"DM Sans", sans-serif', marginBottom: 20 }}>
            ¿Activar la cuenta de <strong>{usuarioActivar.nombre}</strong>? Podrá volver a iniciar sesión.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn variante="neutro" full onClick={() => setUsuarioActivar(null)}>Cancelar</Btn>
            <Btn variante="verde" full disabled={guardando} onClick={handleActivar}>
              {guardando ? 'Activando…' : '▶ Sí, activar'}
            </Btn>
          </div>
        </Modal>
      )}
      {usuarioDesact && (
        <Modal titulo="Desactivar usuario" onClose={() => setUsuarioDesact(null)}>
          <p style={{ fontSize: 14, color: C.gris600, fontFamily: '"DM Sans", sans-serif', marginBottom: 20 }}>
            ¿Desactivar la cuenta de <strong>{usuarioDesact.nombre}</strong>? No podrá iniciar sesión hasta que sea reactivado.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn variante="neutro" full onClick={() => setUsuarioDesact(null)}>Cancelar</Btn>
            <Btn variante="peligro" full disabled={guardando} onClick={handleDesactivar}>
              {guardando ? 'Desactivando…' : '⏸ Sí, desactivar'}
            </Btn>
          </div>
        </Modal>
      )}

      <Toast msg={toast.msg} tipo={toast.tipo} onClose={() => setToast({ msg: '', tipo: 'info' })} />
    </>
  );
}