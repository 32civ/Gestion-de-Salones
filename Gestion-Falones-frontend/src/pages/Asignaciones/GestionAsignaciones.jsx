import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAsignaciones, cancelarAsignacion,
  asignacionAutomatica, asignacionManual,
  getCursos, getSalones, getHorarios, getRecursos,
} from '../../api/asignacionesApi';
import { getSemestreActivo } from '../../api/semestresApi';

// Aprobaciones (para leer comentarios de rechazo)
const BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7138';
const getAprobaciones = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}/api/Aprobaciones`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(typeof data === 'string' ? data : data.message || 'Error');
  return data;
};

// ─── Diseño ────────────────────────────────────────────────────────────────
const C = {
  naranja:       '#E8611A', naranjaOsc:    '#C4511A', naranjaClaro:  '#FFF0E6',
  blanco:        '#FFFFFF', gris50:        '#FAFAF9', gris100:       '#F5F4F2',
  gris200:       '#E8E6E1', gris400:       '#B0ADA6', gris600:       '#6B6860',
  gris900:       '#1C1917', verde:         '#16A34A', verdeClaro:    '#DCFCE7',
  rojo:          '#DC2626', rojoClaro:     '#FEE2E2', azul:          '#2563EB',
  azulClaro:     '#DBEAFE', morado:        '#7C3AED', moradoClaro:   '#EDE9FE',
  amarillo:      '#D97706', amarilloClaro: '#FEF3C7',
};
const sombra       = '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05)';
const sombraMedia  = '0 4px 12px rgba(0,0,0,0.09), 0 2px 4px rgba(0,0,0,0.06)';
const sombraGrande = '0 12px 30px rgba(0,0,0,0.13), 0 4px 10px rgba(0,0,0,0.08)';

const DIAS = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const ESTADO_CONFIG = {
  Pendiente:  { color: C.amarillo, bg: C.amarilloClaro, icono: '⏳' },
  Aprobado:   { color: C.verde,    bg: C.verdeClaro,    icono: '✅' },
  Rechazado:  { color: C.rojo,     bg: C.rojoClaro,     icono: '❌' },
  Cancelada:  { color: C.gris600,  bg: C.gris200,       icono: '🚫' },
};

const getRolDesdeToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return '';
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role || '';
  } catch { return ''; }
};
const ROLES_ADMIN = ['Administrativo','Administrador'];

const formatHora = (str) => (str || '').slice(0, 5);

// ─── Toast ─────────────────────────────────────────────────────────────────
function Toast({ msg, tipo, onClose }) {
  useEffect(() => { if (!msg) return; const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [msg, onClose]);
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
        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 700, flexShrink: 0,
      }}>{icono}</span>
      {msg}
    </div>
  );
}

// ─── Modal base ────────────────────────────────────────────────────────────
function Modal({ titulo, subtitulo, ancho = 520, children, onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(28,25,23,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }} onClick={onClose}>
      <div style={{
        background: C.blanco, borderRadius: 16, padding: '0',
        width: '100%', maxWidth: ancho, boxShadow: sombraGrande,
        animation: 'popIn 0.18s ease', maxHeight: '92vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
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
        {/* Body */}
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
    fantasma:   { bg: hov ? C.gris100 : 'transparent',   color: C.gris600, border: 'none' },
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

// ─── Select estilizado ─────────────────────────────────────────────────────
function Select({ label, value, onChange, options, placeholder, error, disabled }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{
        display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700,
        color: C.gris600, textTransform: 'uppercase', letterSpacing: '0.06em',
        fontFamily: '"DM Sans", sans-serif',
      }}>{label}</label>}
      <select
        value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
        style={{
          width: '100%', padding: '10px 13px', borderRadius: 8, boxSizing: 'border-box',
          border: `1.5px solid ${error ? C.rojo : C.gris200}`,
          fontSize: 14, fontFamily: '"DM Sans", sans-serif', color: value ? C.gris900 : C.gris400,
          background: disabled ? C.gris100 : (error ? C.rojoClaro : C.blanco),
          outline: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B6860' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
        }}
        onFocus={e => { e.target.style.borderColor = error ? C.rojo : C.naranja; }}
        onBlur={e => { e.target.style.borderColor = error ? C.rojo : C.gris200; }}
      >
        <option value="">{placeholder || 'Seleccionar…'}</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p style={{ margin: '4px 0 0', fontSize: 11, color: C.rojo }}>{error}</p>}
    </div>
  );
}

// ─── Badge de estado ───────────────────────────────────────────────────────
function BadgeEstado({ estado }) {
  const cfg = ESTADO_CONFIG[estado] || ESTADO_CONFIG.Pendiente;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.color}30`,
      padding: '3px 10px', borderRadius: 20,
      fontSize: 12, fontWeight: 700, fontFamily: '"DM Sans", sans-serif',
    }}>
      {cfg.icono} {estado}
    </span>
  );
}

// ─── Modal: Asignación Automática ──────────────────────────────────────────
function ModalAutomatica({ cursos, horarios, recursos, onGuardar, onCerrar, cargando }) {
  const [cursoId,    setCursoId]    = useState('');
  const [horarioId,  setHorarioId]  = useState('');
  const [recursosIds,setRecursosIds]= useState([]);
  const [errores,    setErrores]    = useState({});
  const [resultado,  setResultado]  = useState(null);

  const cursosSinAsignar = cursos.filter(c => c.salonAsignado === 'Sin asignar');

  const validar = () => {
    const e = {};
    if (!cursoId)   e.cursoId   = 'Selecciona un curso';
    if (!horarioId) e.horarioId = 'Selecciona un horario';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const toggleRecurso = (id) => {
    setRecursosIds(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!validar()) return;
    const res = await onGuardar({
      cursoId: Number(cursoId),
      horarioId: Number(horarioId),
      recursosRequeridos: recursosIds,
    });
    if (res) setResultado(res);
  };

  return (
    <Modal
      titulo="Asignación Automática"
      subtitulo="El sistema elige el salón más eficiente disponible"
      onClose={onCerrar}
    >
      {resultado ? (
        /* Resultado exitoso */
        <div>
          <div style={{
            background: C.verdeClaro, border: `1.5px solid ${C.verde}40`,
            borderRadius: 12, padding: '18px 20px', marginBottom: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span style={{ fontSize: 24 }}>🎉</span>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#15803D', fontFamily: '"DM Sans", sans-serif' }}>
                Salón asignado correctamente
              </p>
            </div>
            {[
              { label: 'Curso',      valor: resultado.curso },
              { label: 'Docente',    valor: resultado.docente },
              { label: 'Salón',      valor: resultado.salonAsignado },
              { label: 'Capacidad',  valor: `${resultado.capacidad} personas` },
              { label: 'Cupo curso', valor: `${resultado.cupoMaximo} personas` },
              { label: 'Horario',    valor: `${DIAS[resultado.horario?.diaSemana] || ''} ${formatHora(resultado.horario?.horaInicio)} – ${formatHora(resultado.horario?.horaFin)}` },
              { label: 'Estado',     valor: resultado.estado },
            ].map(({ label, valor }) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '6px 0', borderBottom: `1px solid ${C.verde}20`,
                fontFamily: '"DM Sans", sans-serif',
              }}>
                <span style={{ fontSize: 13, color: '#15803D', fontWeight: 600 }}>{label}</span>
                <span style={{ fontSize: 13, color: '#14532D', fontWeight: 700 }}>{valor}</span>
              </div>
            ))}
          </div>
          <Btn variante="primario" full onClick={onCerrar}>Entendido</Btn>
        </div>
      ) : (
        /* Formulario */
        <div>
          <Select
            label="Curso (sin asignar)"
            value={cursoId}
            onChange={setCursoId}
            placeholder="Seleccionar curso…"
            error={errores.cursoId}
            options={cursosSinAsignar.map(c => ({
              value: c.id,
              label: `${c.materia} — ${c.docente} (cupo: ${c.cupoMaximo})`,
            }))}
          />

          <Select
            label="Horario"
            value={horarioId}
            onChange={setHorarioId}
            placeholder="Seleccionar horario…"
            error={errores.horarioId}
            options={horarios.map(h => ({
              value: h.id,
              label: `${h.dia} ${h.horaInicio} – ${h.horaFin}`,
            }))}
          />

          {/* Recursos requeridos */}
          {recursos.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{
                margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: C.gris600,
                textTransform: 'uppercase', letterSpacing: '0.06em',
                fontFamily: '"DM Sans", sans-serif',
              }}>Recursos requeridos <span style={{ color: C.gris400, fontWeight: 400, textTransform: 'none' }}>(opcional)</span></p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {recursos.map(r => {
                  const sel = recursosIds.includes(r.id);
                  return (
                    <button key={r.id} onClick={() => toggleRecurso(r.id)} style={{
                      padding: '5px 12px', borderRadius: 8, cursor: 'pointer',
                      border: `1.5px solid ${sel ? C.naranja : C.gris200}`,
                      background: sel ? C.naranjaClaro : C.blanco,
                      color: sel ? C.naranja : C.gris600,
                      fontSize: 12, fontWeight: 700, fontFamily: '"DM Sans", sans-serif',
                      transition: 'all 0.14s',
                    }}>
                      {sel ? '✓ ' : ''}{r.nombre}
                    </button>
                  );
                })}
              </div>
              <p style={{ margin: '6px 0 0', fontSize: 11, color: C.gris400, fontFamily: '"DM Sans", sans-serif' }}>
                El sistema solo considerará salones que tengan estos recursos.
              </p>
            </div>
          )}

          {/* Info */}
          <div style={{
            background: C.azulClaro, border: `1px solid ${C.azul}30`,
            borderRadius: 10, padding: '12px 14px', marginBottom: 20,
            display: 'flex', gap: 8,
          }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>🤖</span>
            <p style={{ margin: 0, fontSize: 12, color: '#1E40AF', fontFamily: '"DM Sans", sans-serif', lineHeight: 1.5 }}>
              El sistema buscará el salón libre más pequeño que cumpla la capacidad del curso y los recursos seleccionados.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Btn variante="neutro" onClick={onCerrar} full>Cancelar</Btn>
            <Btn variante="primario" onClick={handleSubmit} disabled={cargando} full>
              {cargando ? 'Asignando…' : '🤖 Asignar automáticamente'}
            </Btn>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ─── Modal: Asignación Manual ──────────────────────────────────────────────
function ModalManual({ cursos, salones, horarios, onGuardar, onCerrar, cargando }) {
  const [cursoId,   setCursoId]   = useState('');
  const [salonId,   setSalonId]   = useState('');
  const [horarioId, setHorarioId] = useState('');
  const [errores,   setErrores]   = useState({});

  const cursosSinAsignar = cursos.filter(c => c.salonAsignado === 'Sin asignar');
  const cursoSel = cursos.find(c => c.id === Number(cursoId));
  const salonSel = salones.find(s => s.id === Number(salonId));

  // Advertencia de capacidad
  const capInsuficiente = cursoSel && salonSel && salonSel.capacidad < cursoSel.cupoMaximo;

  const validar = () => {
    const e = {};
    if (!cursoId)   e.cursoId   = 'Selecciona un curso';
    if (!salonId)   e.salonId   = 'Selecciona un salón';
    if (!horarioId) e.horarioId = 'Selecciona un horario';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  return (
    <Modal titulo="Asignación Manual" subtitulo="Elige el curso, salón y horario manualmente" onClose={onCerrar}>

      <Select
        label="Curso (sin asignar)"
        value={cursoId} onChange={setCursoId}
        placeholder="Seleccionar curso…" error={errores.cursoId}
        options={cursosSinAsignar.map(c => ({
          value: c.id,
          label: `${c.materia} — ${c.docente} (cupo: ${c.cupoMaximo})`,
        }))}
      />

      <Select
        label="Salón"
        value={salonId} onChange={setSalonId}
        placeholder="Seleccionar salón…" error={errores.salonId}
        options={salones.map(s => ({
          value: s.id,
          label: `${s.nombre} (cap: ${s.capacidad})`,
        }))}
      />

      {/* Advertencia capacidad */}
      {capInsuficiente && (
        <div style={{
          background: C.amarilloClaro, border: `1px solid ${C.amarillo}40`,
          borderRadius: 10, padding: '10px 14px', marginTop: -8, marginBottom: 16,
          display: 'flex', gap: 8, alignItems: 'center',
        }}>
          <span>⚠️</span>
          <p style={{ margin: 0, fontSize: 12, color: '#92400E', fontFamily: '"DM Sans", sans-serif' }}>
            El salón tiene capacidad {salonSel.capacidad} pero el curso necesita {cursoSel.cupoMaximo}. El backend rechazará esta asignación.
          </p>
        </div>
      )}

      <Select
        label="Horario"
        value={horarioId} onChange={setHorarioId}
        placeholder="Seleccionar horario…" error={errores.horarioId}
        options={horarios.map(h => ({
          value: h.id,
          label: `${h.dia} ${h.horaInicio} – ${h.horaFin}`,
        }))}
      />

      {/* Preview */}
      {cursoSel && salonSel && horarioId && (
        <div style={{
          background: C.naranjaClaro, border: `1.5px solid ${C.naranja}30`,
          borderRadius: 10, padding: '14px 16px', marginBottom: 20,
        }}>
          <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: C.naranjaOsc, fontFamily: '"DM Sans", sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Resumen de asignación
          </p>
          {[
            { label: 'Curso',  valor: `${cursoSel.materia} — ${cursoSel.docente}` },
            { label: 'Salón',  valor: `${salonSel.nombre} (cap. ${salonSel.capacidad})` },
            { label: 'Horario', valor: (() => { const h = horarios.find(h => h.id === Number(horarioId)); return h ? `${h.dia} ${h.horaInicio} – ${h.horaFin}` : ''; })() },
          ].map(({ label, valor }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontFamily: '"DM Sans", sans-serif' }}>
              <span style={{ fontSize: 12, color: C.naranjaOsc, fontWeight: 600 }}>{label}</span>
              <span style={{ fontSize: 12, color: C.naranjaOsc, fontWeight: 700 }}>{valor}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <Btn variante="neutro" onClick={onCerrar} full>Cancelar</Btn>
        <Btn variante="primario" onClick={() => { if (validar()) onGuardar({ cursoId: Number(cursoId), salonId: Number(salonId), horarioId: Number(horarioId) }); }} disabled={cargando} full>
          {cargando ? 'Creando…' : '📋 Crear asignación'}
        </Btn>
      </div>
    </Modal>
  );
}

// ─── Modal: Confirmar cancelación ─────────────────────────────────────────
function ModalCancelar({ asignacion, onConfirmar, onCerrar, cargando }) {
  return (
    <Modal titulo="Cancelar asignación" onClose={onCerrar}>
      <div style={{
        background: C.rojoClaro, border: `1px solid #FECACA`,
        borderRadius: 10, padding: '14px 16px', marginBottom: 20,
        display: 'flex', gap: 10,
      }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
        <p style={{ margin: 0, fontSize: 14, color: '#7F1D1D', fontFamily: '"DM Sans", sans-serif', lineHeight: 1.6 }}>
          ¿Cancelar la asignación de <strong>{asignacion.curso}</strong> en el salón <strong>{asignacion.salon}</strong>?
          El estado cambiará a <strong>Cancelada</strong>.
        </p>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <Btn variante="neutro" onClick={onCerrar} full>Volver</Btn>
        <Btn variante="peligro" onClick={onConfirmar} disabled={cargando} full>
          {cargando ? 'Cancelando…' : 'Sí, cancelar asignación'}
        </Btn>
      </div>
    </Modal>
  );
}

// ─── Modal: Detalle de asignación ─────────────────────────────────────────
function ModalDetalle({ asignacion, onCerrar, onCancelar, esAdmin }) {
  const cfg = ESTADO_CONFIG[asignacion.estado] || ESTADO_CONFIG.Pendiente;
  const dia = DIAS[asignacion.dia] || asignacion.dia || '—';

  return (
    <Modal titulo="Detalle de asignación" onClose={onCerrar}>
      {/* Header colorido */}
      <div style={{
        background: `linear-gradient(135deg, ${C.naranja}, ${C.naranjaOsc})`,
        borderRadius: 12, padding: '16px 18px', marginBottom: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: C.blanco, fontFamily: '"DM Sans", sans-serif' }}>
            {asignacion.curso}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.75)', fontFamily: '"DM Sans", sans-serif' }}>
            ID #{asignacion.id}
          </p>
        </div>
        <BadgeEstado estado={asignacion.estado} />
      </div>

      {/* Filas de detalle */}
      {[
        { icono: '👨‍🏫', label: 'Docente',    valor: asignacion.docente },
        { icono: '🏫',  label: 'Salón',      valor: `${asignacion.salon} (cap. ${asignacion.capacidad})` },
        { icono: '📅',  label: 'Día',        valor: dia },
        { icono: '🕐',  label: 'Horario',    valor: `${formatHora(asignacion.horaInicio)} – ${formatHora(asignacion.horaFin)}` },
      ].map(({ icono, label, valor }) => (
        <div key={label} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 0', borderBottom: `1px solid ${C.gris200}`,
        }}>
          <span style={{
            width: 34, height: 34, borderRadius: 8, background: C.gris100,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0,
          }}>{icono}</span>
          <div>
            <p style={{ margin: 0, fontSize: 11, color: C.gris400, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: '"DM Sans", sans-serif' }}>{label}</p>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.gris900, fontFamily: '"DM Sans", sans-serif' }}>{valor}</p>
          </div>
        </div>
      ))}

      {/* Comentario de rechazo — visible solo para el admin */}
      {asignacion.estado === 'Rechazado' && asignacion.comentarioRechazo && (
        <div style={{
          background: C.rojoClaro, border: `1px solid ${C.rojo}30`,
          borderRadius: 10, padding: '14px 16px', marginTop: 16,
          display: 'flex', gap: 10,
        }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>💬</span>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: C.rojo, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: '"DM Sans", sans-serif' }}>
              Motivo del rechazo
            </p>
            <p style={{ margin: 0, fontSize: 13, color: '#7F1D1D', fontFamily: '"DM Sans", sans-serif', lineHeight: 1.5 }}>
              {asignacion.comentarioRechazo}
            </p>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <Btn variante="neutro" onClick={onCerrar} full>Cerrar</Btn>
        {esAdmin && asignacion.estado !== 'Cancelada' && (
          <Btn variante="peligro" onClick={() => { onCerrar(); onCancelar(asignacion); }} full>
            🚫 Cancelar asignación
          </Btn>
        )}
      </div>
    </Modal>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{ background: C.blanco, border: `1.5px solid ${C.gris200}`, borderRadius: 13, padding: '16px 18px' }}>
      {[70, 50, 85, 40].map((w, i) => (
        <div key={i} style={{
          height: 12, width: `${w}%`, background: C.gris200, borderRadius: 6,
          marginBottom: 10, animation: 'pulse 1.4s ease-in-out infinite',
          animationDelay: `${i * 0.12}s`,
        }} />
      ))}
    </div>
  );
}

// ─── Tarjeta de asignación ─────────────────────────────────────────────────
function TarjetaAsignacion({ asignacion, esAdmin, onVer, onCancelar }) {
  const [hover, setHover] = useState(false);
  const cfg = ESTADO_CONFIG[asignacion.estado] || ESTADO_CONFIG.Pendiente;
  const dia = DIAS[asignacion.dia] || asignacion.dia || '—';

  return (
    <div
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: C.blanco,
        border: `1.5px solid ${hover ? C.naranja : C.gris200}`,
        borderRadius: 13, padding: '16px 18px',
        boxShadow: hover ? sombraMedia : sombra,
        transform: hover ? 'translateY(-2px)' : 'none',
        transition: 'all 0.18s ease',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}
    >
      {/* Estado + ID */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <BadgeEstado estado={asignacion.estado} />
        <span style={{ fontSize: 11, color: C.gris400, fontFamily: '"DM Sans", sans-serif' }}>#{asignacion.id}</span>
      </div>

      {/* Curso */}
      <div>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: C.gris900, fontFamily: '"DM Sans", sans-serif' }}>
          {asignacion.curso}
        </p>
        <p style={{ margin: '2px 0 0', fontSize: 12, color: C.gris400, fontFamily: '"DM Sans", sans-serif' }}>
          👨‍🏫 {asignacion.docente}
        </p>
      </div>

      {/* Salón + Horario */}
      <div style={{
        background: C.gris50, borderRadius: 8, padding: '8px 10px',
        display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        <p style={{ margin: 0, fontSize: 12, color: C.gris600, fontWeight: 600, fontFamily: '"DM Sans", sans-serif' }}>
          🏫 {asignacion.salon} · 👥 {asignacion.capacidad}
        </p>
        <p style={{ margin: 0, fontSize: 12, color: C.gris600, fontFamily: '"DM Sans", sans-serif' }}>
          📅 {dia} · 🕐 {formatHora(asignacion.horaInicio)} – {formatHora(asignacion.horaFin)}
        </p>
      </div>

      {/* Comentario de rechazo */}
      {asignacion.estado === 'Rechazado' && asignacion.comentarioRechazo && (
        <div style={{
          background: C.rojoClaro, border: `1px solid ${C.rojo}25`,
          borderRadius: 8, padding: '8px 10px',
          display: 'flex', gap: 6, alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: 13, flexShrink: 0 }}>💬</span>
          <div>
            <p style={{ margin: '0 0 2px', fontSize: 10, fontWeight: 700, color: C.rojo, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: '"DM Sans", sans-serif' }}>
              Motivo del rechazo
            </p>
            <p style={{ margin: 0, fontSize: 12, color: '#7F1D1D', fontFamily: '"DM Sans", sans-serif', lineHeight: 1.4 }}>
              {asignacion.comentarioRechazo}
            </p>
          </div>
        </div>
      )}

      {/* Acciones */}
      <div style={{ borderTop: `1px solid ${C.gris200}`, paddingTop: 10, display: 'flex', gap: 6 }}>
        <Btn variante="neutro" small full onClick={() => onVer(asignacion)}>👁 Ver</Btn>
        {esAdmin && asignacion.estado !== 'Cancelada' && (
          <Btn variante="peligro" small full onClick={() => onCancelar(asignacion)}>🚫 Cancelar</Btn>
        )}
      </div>
    </div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────
export default function GestionAsignaciones() {
  const navigate = useNavigate();

  const [asignaciones,  setAsignaciones]  = useState([]);
  const [cursos,        setCursos]        = useState([]);
  const [salones,       setSalones]       = useState([]);
  const [horarios,      setHorarios]      = useState([]);
  const [recursos,      setRecursos]      = useState([]);
  const [semestre, setSemestre] = useState('');//Nuevo

  const [cargando,      setCargando]      = useState(true);
  const [filtroEstado,  setFiltroEstado]  = useState('Todos');
  const [busqueda,      setBusqueda]      = useState('');

  const [modalAuto,     setModalAuto]     = useState(false);
  const [modalManual,   setModalManual]   = useState(false);
  const [asigVer,       setAsigVer]       = useState(null);
  const [asigCancelar,  setAsigCancelar]  = useState(null);
  const [guardando,     setGuardando]     = useState(false);
  const [toast,         setToast]         = useState({ msg: '', tipo: 'info' });

  const esAdmin = ROLES_ADMIN.includes(getRolDesdeToken());
  const mostrarToast = useCallback((msg, tipo = 'info') => setToast({ msg, tipo }), []);

  const cargarTodo = useCallback(async () => {
  setCargando(true);
  try {
    const [a, c, s, h, r, ap, sem] = await Promise.allSettled([
      getAsignaciones(),
      getCursos(),
      getSalones(),
      getHorarios(),
      getRecursos(),
      getAprobaciones(),
      getSemestreActivo(), // ← nuevo
    ]);

    // Semestre activo
    if (sem.status === 'fulfilled') setSemestre(sem.value.nombre);

    const asigs       = a.status  === 'fulfilled' ? a.value  : [];
    const aprobaciones = ap.status === 'fulfilled' ? ap.value : [];

    const mapaComentarios = {};
    aprobaciones.forEach(ap => {
      if (!ap.aprobado && ap.asignacionId)
        mapaComentarios[ap.asignacionId] = ap.comentario;
    });

    const asigConComentario = asigs.map(asig => ({
      ...asig,
      comentarioRechazo: asig.estado === 'Rechazado'
        ? (mapaComentarios[asig.id] || '') : '',
    }));

    setAsignaciones(asigConComentario);
    if (c.status === 'fulfilled') setCursos(c.value);
    if (s.status === 'fulfilled') setSalones(s.value);
    if (h.status === 'fulfilled') setHorarios(h.value);
    if (r.status === 'fulfilled') setRecursos(r.value);

  } catch (e) {
    mostrarToast(e.message, 'error');
  } finally { setCargando(false); }
  }, [mostrarToast]);

  useEffect(() => { cargarTodo(); }, [cargarTodo]);

  // ── Filtrado ──
  const asignacionesFiltradas = asignaciones.filter(a => {
    const coincideEstado  = filtroEstado === 'Todos' || a.estado === filtroEstado;
    const coincideBusqueda = !busqueda ||
      a.curso?.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.docente?.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.salon?.toLowerCase().includes(busqueda.toLowerCase());
    return coincideEstado && coincideBusqueda;
  });

  // ── Handlers ──
  const handleAutomatica = async (datos) => {
    setGuardando(true);
    try {
      const res = await asignacionAutomatica(datos);
      mostrarToast('Salón asignado automáticamente ✓', 'exito');
      cargarTodo();
      return res;
    } catch (e) {
      mostrarToast(e.message, 'error');
      return null;
    } finally { setGuardando(false); }
  };

  const handleManual = async (datos) => {
    setGuardando(true);
    try {
      await asignacionManual(datos);
      mostrarToast('Asignación manual creada correctamente ✓', 'exito');
      setModalManual(false);
      cargarTodo();
    } catch (e) {
      mostrarToast(e.message, 'error');
    } finally { setGuardando(false); }
  };

  const handleCancelar = async () => {
    setGuardando(true);
    try {
      await cancelarAsignacion(asigCancelar.id);
      mostrarToast('Asignación cancelada ✓', 'exito');
      setAsigCancelar(null);
      cargarTodo();
    } catch (e) {
      mostrarToast(e.message, 'error');
    } finally { setGuardando(false); }
  };

  // ── Stats ──
  const conteo = {
    total:     asignaciones.length,
    pendiente: asignaciones.filter(a => a.estado === 'Pendiente').length,
    aprobado:  asignaciones.filter(a => a.estado === 'Aprobado').length,
    cancelada: asignaciones.filter(a => a.estado === 'Cancelada').length,
  };

  const ESTADOS_FILTRO = ['Todos', 'Pendiente', 'Aprobado', 'Rechazado', 'Cancelada'];

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
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, background: C.naranja,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                  }}>📋</div>
                  <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: C.gris900 }}>
                    Gestión de Asignaciones
                  </h1>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: C.gris400 }}>
                  {asignaciones.length} asignación{asignaciones.length !== 1 ? 'es' : ''} en total
                </p>
                {semestre && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: C.naranjaClaro, border: `1px solid ${C.naranja}40`,
                    borderRadius: 20, padding: '3px 12px', marginTop: 4,
                    fontSize: 12, color: C.naranja, fontWeight: 700,
                    fontFamily: '"DM Sans", sans-serif',
                  }}>
                    📅 {semestre}
                  </span>
                )}
              </div>
            </div>

            {/* Acciones */}
            {esAdmin && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Btn variante="secundario" onClick={() => setModalManual(true)}>
                  📋 Manual
                </Btn>
                <Btn variante="primario" onClick={() => setModalAuto(true)}>
                  🤖 Automática
                </Btn>
              </div>
            )}
          </div>

          {/* ── Stats ── */}
          <div style={{
            display: 'grid', gap: 12, marginBottom: 24,
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          }}>
            {[
              { label: 'Total',      valor: conteo.total,     color: C.naranja, bg: C.naranjaClaro, icono: '📋' },
              { label: 'Pendientes', valor: conteo.pendiente, color: C.amarillo, bg: C.amarilloClaro, icono: '⏳' },
              { label: 'Aprobadas',  valor: conteo.aprobado,  color: C.verde,   bg: C.verdeClaro,   icono: '✅' },
              { label: 'Canceladas', valor: conteo.cancelada, color: C.gris600, bg: C.gris200,      icono: '🚫' },
            ].map(({ label, valor, color, bg, icono }) => (
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
            <div style={{ position: 'relative', flex: '1 1 220px' }}>
              <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: C.gris400, fontSize: 14 }}>🔍</span>
              <input
                type="text" placeholder="Buscar por curso, docente o salón…" value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                style={{
                  width: '100%', padding: '9px 12px 9px 32px', borderRadius: 8,
                  border: `1.5px solid ${C.gris200}`, fontSize: 13,
                  color: C.gris900, fontFamily: '"DM Sans", sans-serif',
                  background: C.gris50, outline: 'none',
                }}
                onFocus={e => { e.target.style.borderColor = C.naranja; }}
                onBlur={e => { e.target.style.borderColor = C.gris200; }}
              />
            </div>

            {/* Filtro estado */}
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {ESTADOS_FILTRO.map(e => {
                const activo = filtroEstado === e;
                const cfg = ESTADO_CONFIG[e] || { color: C.naranja, bg: C.naranjaClaro };
                return (
                  <button key={e} onClick={() => setFiltroEstado(e)} style={{
                    padding: '5px 12px', borderRadius: 8, cursor: 'pointer',
                    border: `1.5px solid ${activo ? cfg.color : C.gris200}`,
                    background: activo ? cfg.bg : C.blanco,
                    color: activo ? cfg.color : C.gris600,
                    fontSize: 12, fontWeight: 700, fontFamily: '"DM Sans", sans-serif',
                    transition: 'all 0.14s',
                  }}>{e}</button>
                );
              })}
            </div>

            <span style={{ marginLeft: 'auto', fontSize: 12, color: C.gris400, fontFamily: '"DM Sans", sans-serif' }}>
              {asignacionesFiltradas.length} resultado{asignacionesFiltradas.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* ── Grid ── */}
          {cargando ? (
            <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))' }}>
              {[...Array(6)].map((_, i) => <Skeleton key={i} />)}
            </div>
          ) : asignacionesFiltradas.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '60px 24px',
              background: C.blanco, borderRadius: 14, border: `1.5px dashed ${C.gris200}`,
            }}>
              <p style={{ fontSize: 38, margin: '0 0 10px' }}>📋</p>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.gris900 }}>
                {busqueda || filtroEstado !== 'Todos' ? 'Sin resultados' : 'No hay asignaciones aún'}
              </p>
              <p style={{ margin: '6px 0 0', fontSize: 13, color: C.gris400 }}>
                {esAdmin && !busqueda && filtroEstado === 'Todos'
                  ? 'Usa los botones de arriba para crear la primera asignación.'
                  : 'Prueba con otros filtros.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))' }}>
              {asignacionesFiltradas.map(a => (
                <TarjetaAsignacion
                  key={a.id} asignacion={a} esAdmin={esAdmin}
                  onVer={setAsigVer} onCancelar={setAsigCancelar}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Modales ── */}
      {modalAuto && (
        <ModalAutomatica
          cursos={cursos} horarios={horarios} recursos={recursos}
          onGuardar={handleAutomatica} onCerrar={() => setModalAuto(false)} cargando={guardando}
        />
      )}
      {modalManual && (
        <ModalManual
          cursos={cursos} salones={salones} horarios={horarios}
          onGuardar={handleManual} onCerrar={() => setModalManual(false)} cargando={guardando}
        />
      )}
      {asigVer && (
        <ModalDetalle
          asignacion={asigVer} esAdmin={esAdmin}
          onCerrar={() => setAsigVer(null)} onCancelar={setAsigCancelar}
        />
      )}
      {asigCancelar && (
        <ModalCancelar
          asignacion={asigCancelar}
          onConfirmar={handleCancelar} onCerrar={() => setAsigCancelar(null)} cargando={guardando}
        />
      )}

      <Toast msg={toast.msg} tipo={toast.tipo} onClose={() => setToast({ msg: '', tipo: 'info' })} />
    </>
  );
}