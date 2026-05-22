import { useState, useEffect, useCallback } from 'react';
import { getHorarios, crearHorario, editarHorario, eliminarHorario } from '../../api/horariosApi';

// ─── Tokens de diseño ──────────────────────────────────────────────────────
const C = {
  naranja:       '#E8611A',
  naranjaOsc:    '#C4511A',
  naranjaClaro:  '#FFF0E6',
  blanco:        '#FFFFFF',
  gris50:        '#FAFAF9',
  gris100:       '#F5F4F2',
  gris200:       '#E8E6E1',
  gris400:       '#B0ADA6',
  gris600:       '#6B6860',
  gris900:       '#1C1917',
  verde:         '#16A34A',
  verdeClaro:    '#DCFCE7',
  rojo:          '#DC2626',
  rojoClaro:     '#FEE2E2',
  azul:          '#2563EB',
  azulClaro:     '#DBEAFE',
  morado:        '#7C3AED',
  moradoClaro:   '#EDE9FE',
  amarillo:      '#D97706',
  amarilloClaro: '#FEF3C7',
};

const sombra       = '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05)';
const sombraMedia  = '0 4px 12px rgba(0,0,0,0.09), 0 2px 4px rgba(0,0,0,0.06)';
const sombraGrande = '0 12px 30px rgba(0,0,0,0.13), 0 4px 10px rgba(0,0,0,0.08)';

const DIAS = [
  { num: 1, nombre: 'Lunes',     corto: 'Lun', color: C.azul,    bg: C.azulClaro    },
  { num: 2, nombre: 'Martes',    corto: 'Mar', color: C.morado,  bg: C.moradoClaro  },
  { num: 3, nombre: 'Miércoles', corto: 'Mié', color: C.verde,   bg: C.verdeClaro   },
  { num: 4, nombre: 'Jueves',    corto: 'Jue', color: C.naranja, bg: C.naranjaClaro },
  { num: 5, nombre: 'Viernes',   corto: 'Vie', color: C.amarillo,bg: C.amarilloClaro},
  { num: 6, nombre: 'Sábado',    corto: 'Sáb', color: C.rojo,    bg: C.rojoClaro    },
  { num: 7, nombre: 'Domingo',   corto: 'Dom', color: C.gris600, bg: C.gris200      },
];

const getRolDesdeToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return '';
    const payload = JSON.parse(atob(token.split('.')[1]));
    return (
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      payload.role || ''
    );
  } catch { return ''; }
};

const ROLES_ADMIN = ['Administrador', 'Administrativo'];

// Convierte "08:30" → { hours: 8, minutes: 30 } para enviar al backend como TimeSpan
const parsearHora = (str) => {
  const [h, m] = str.split(':').map(Number);
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:00`;
};

// Calcula duración en minutos entre dos strings "HH:mm"
const duracionMin = (inicio, fin) => {
  const [h1, m1] = inicio.split(':').map(Number);
  const [h2, m2] = fin.split(':').map(Number);
  return (h2 * 60 + m2) - (h1 * 60 + m1);
};

const formatDuracion = (min) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
};

// ─── Toast ─────────────────────────────────────────────────────────────────
function Toast({ msg, tipo, onClose }) {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onClose, 3800);
    return () => clearTimeout(t);
  }, [msg, onClose]);
  if (!msg) return null;

  const mapa = {
    exito: { bg: C.verdeClaro,  borde: C.verde,  texto: '#15803D', icono: '✓' },
    error: { bg: C.rojoClaro,   borde: C.rojo,   texto: '#B91C1C', icono: '✕' },
    info:  { bg: C.azulClaro,   borde: C.azul,   texto: '#1D4ED8', icono: 'ℹ' },
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
function Modal({ titulo, ancho = 460, children, onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(28,25,23,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }} onClick={onClose}>
      <div style={{
        background: C.blanco, borderRadius: 16, padding: '28px 30px',
        width: '100%', maxWidth: ancho, boxShadow: sombraGrande,
        animation: 'popIn 0.18s ease',
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 24,
        }}>
          <h2 style={{
            margin: 0, fontSize: 18, fontWeight: 800,
            color: C.gris900, fontFamily: '"DM Sans", sans-serif',
          }}>{titulo}</h2>
          <button onClick={onClose} style={{
            background: C.gris200, border: 'none', borderRadius: 8,
            width: 30, height: 30, cursor: 'pointer', fontSize: 15,
            color: C.gris600, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Botón ─────────────────────────────────────────────────────────────────
function Btn({ children, onClick, disabled, variante = 'primario', full = false, small = false }) {
  const [hover, setHover] = useState(false);
  const estilos = {
    primario:   { bg: hover ? C.naranjaOsc : C.naranja, color: C.blanco,  border: 'none' },
    secundario: { bg: hover ? C.naranjaClaro : C.blanco, color: C.naranja, border: `1.5px solid ${C.naranja}` },
    peligro:    { bg: hover ? '#B91C1C' : C.rojo,        color: C.blanco,  border: 'none' },
    neutro:     { bg: hover ? C.gris200 : C.blanco,      color: C.gris600, border: `1.5px solid ${C.gris200}` },
  };
  const e = estilos[variante];
  return (
    <button
      onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: full ? '100%' : undefined,
        padding: small ? '5px 12px' : '9px 18px',
        borderRadius: 8, border: e.border || 'none',
        background: disabled ? C.gris200 : e.bg,
        color: disabled ? C.gris400 : e.color,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: small ? 12 : 14, fontWeight: 700,
        fontFamily: '"DM Sans", sans-serif',
        transition: 'background 0.14s',
        display: 'inline-flex', alignItems: 'center', gap: 6,
      }}
    >{children}</button>
  );
}

// ─── Modal: Formulario crear/editar horario ────────────────────────────────
function ModalFormHorario({ inicial, onGuardar, onCerrar, cargando }) {
  const diaInicial = inicial
    ? DIAS.find(d => d.nombre === inicial.dia)?.num || 1
    : 1;

  const [dia,       setDia]       = useState(diaInicial);
  const [horaInicio,setHoraInicio]= useState(inicial?.horaInicio || '07:00');
  const [horaFin,   setHoraFin]   = useState(inicial?.horaFin    || '09:00');
  const [errores,   setErrores]   = useState({});

  const validar = () => {
    const e = {};
    const [h1, m1] = horaInicio.split(':').map(Number);
    const [h2, m2] = horaFin.split(':').map(Number);
    const minInicio = h1 * 60 + m1;
    const minFin    = h2 * 60 + m2;

    if (minInicio < 6 * 60)       e.horaInicio = 'Mínimo 06:00';
    if (minFin > 22 * 60)         e.horaFin    = 'Máximo 22:00';
    if (minFin <= minInicio)      e.horaFin    = 'Debe ser mayor a la hora de inicio';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const diaInfo = DIAS.find(d => d.num === dia);
  const duracion = duracionMin(horaInicio, horaFin);

  return (
    <Modal titulo={inicial ? 'Editar horario' : 'Nuevo horario'} onClose={onCerrar}>

      {/* Selector de día */}
      <p style={{
        margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: C.gris600,
        textTransform: 'uppercase', letterSpacing: '0.06em',
        fontFamily: '"DM Sans", sans-serif',
      }}>Día de la semana</p>
      <div style={{
        display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20,
      }}>
        {DIAS.map(d => (
          <button
            key={d.num}
            onClick={() => setDia(d.num)}
            style={{
              padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
              border: `1.5px solid ${dia === d.num ? d.color : C.gris200}`,
              background: dia === d.num ? d.bg : C.blanco,
              color: dia === d.num ? d.color : C.gris600,
              fontSize: 13, fontWeight: 700,
              fontFamily: '"DM Sans", sans-serif',
              transition: 'all 0.14s',
            }}
          >{d.corto}</button>
        ))}
      </div>

      {/* Horas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
        {/* Hora inicio */}
        <div>
          <label style={{
            display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700,
            color: C.gris600, textTransform: 'uppercase', letterSpacing: '0.06em',
            fontFamily: '"DM Sans", sans-serif',
          }}>Hora inicio</label>
          <input
            type="time" value={horaInicio} min="06:00" max="22:00"
            onChange={e => setHoraInicio(e.target.value)}
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 8, boxSizing: 'border-box',
              border: `1.5px solid ${errores.horaInicio ? C.rojo : C.gris200}`,
              fontSize: 14, fontFamily: '"DM Sans", sans-serif', color: C.gris900,
              background: errores.horaInicio ? C.rojoClaro : C.blanco, outline: 'none',
            }}
            onFocus={e => { e.target.style.borderColor = C.naranja; }}
            onBlur={e => { e.target.style.borderColor = errores.horaInicio ? C.rojo : C.gris200; }}
          />
          {errores.horaInicio && (
            <p style={{ margin: '4px 0 0', fontSize: 11, color: C.rojo }}>{errores.horaInicio}</p>
          )}
        </div>

        {/* Hora fin */}
        <div>
          <label style={{
            display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700,
            color: C.gris600, textTransform: 'uppercase', letterSpacing: '0.06em',
            fontFamily: '"DM Sans", sans-serif',
          }}>Hora fin</label>
          <input
            type="time" value={horaFin} min="06:00" max="22:00"
            onChange={e => setHoraFin(e.target.value)}
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 8, boxSizing: 'border-box',
              border: `1.5px solid ${errores.horaFin ? C.rojo : C.gris200}`,
              fontSize: 14, fontFamily: '"DM Sans", sans-serif', color: C.gris900,
              background: errores.horaFin ? C.rojoClaro : C.blanco, outline: 'none',
            }}
            onFocus={e => { e.target.style.borderColor = C.naranja; }}
            onBlur={e => { e.target.style.borderColor = errores.horaFin ? C.rojo : C.gris200; }}
          />
          {errores.horaFin && (
            <p style={{ margin: '4px 0 0', fontSize: 11, color: C.rojo }}>{errores.horaFin}</p>
          )}
        </div>
      </div>

      {/* Preview del bloque */}
      {duracion > 0 && (
        <div style={{
          background: diaInfo.bg, border: `1.5px solid ${diaInfo.color}30`,
          borderRadius: 10, padding: '12px 16px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: diaInfo.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: C.blanco, fontSize: 16,
          }}>🕐</div>
          <div>
            <p style={{
              margin: 0, fontSize: 14, fontWeight: 700, color: C.gris900,
              fontFamily: '"DM Sans", sans-serif',
            }}>
              {diaInfo.nombre} · {horaInicio} – {horaFin}
            </p>
            <p style={{
              margin: 0, fontSize: 12, color: diaInfo.color, fontWeight: 600,
              fontFamily: '"DM Sans", sans-serif',
            }}>Duración: {formatDuracion(duracion)}</p>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <Btn variante="neutro" onClick={onCerrar} full>Cancelar</Btn>
        <Btn
          variante="primario" full disabled={cargando}
          onClick={() => {
            if (!validar()) return;
            onGuardar({
              diaSemana: dia,
              horaInicio: parsearHora(horaInicio),
              horaFin: parsearHora(horaFin),
            });
          }}
        >
          {cargando ? 'Guardando…' : inicial ? 'Guardar cambios' : 'Crear horario'}
        </Btn>
      </div>
    </Modal>
  );
}

// ─── Modal: Confirmar eliminación ─────────────────────────────────────────
function ModalEliminar({ horario, onConfirmar, onCerrar, cargando }) {
  const diaInfo = DIAS.find(d => d.nombre === horario.dia) || DIAS[0];
  return (
    <Modal titulo="Eliminar horario" onClose={onCerrar}>
      <div style={{
        background: C.rojoClaro, border: `1px solid #FECACA`,
        borderRadius: 10, padding: '14px 16px', marginBottom: 20,
        display: 'flex', gap: 10, alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: 20 }}>⚠️</span>
        <p style={{
          margin: 0, fontSize: 14, color: '#7F1D1D',
          fontFamily: '"DM Sans", sans-serif', lineHeight: 1.6,
        }}>
          ¿Eliminar el bloque del <strong>{horario.dia}</strong> de{' '}
          <strong>{horario.horaInicio}</strong> a <strong>{horario.horaFin}</strong>?
          Fallará si tiene asignaciones activas.
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

// ─── Tarjeta de horario ────────────────────────────────────────────────────
function TarjetaHorario({ horario, esAdmin, onEditar, onEliminar }) {
  const [hover, setHover] = useState(false);
  const diaInfo = DIAS.find(d => d.nombre === horario.dia) || DIAS[0];
  const duracion = duracionMin(horario.horaInicio, horario.horaFin);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: C.blanco,
        border: `1.5px solid ${hover ? diaInfo.color : C.gris200}`,
        borderRadius: 13, padding: '16px 18px',
        boxShadow: hover ? sombraMedia : sombra,
        transform: hover ? 'translateY(-2px)' : 'none',
        transition: 'all 0.18s ease',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}
    >
      {/* Día badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          background: diaInfo.bg, color: diaInfo.color,
          border: `1.5px solid ${diaInfo.color}30`,
          padding: '3px 12px', borderRadius: 20,
          fontSize: 12, fontWeight: 700, fontFamily: '"DM Sans", sans-serif',
        }}>{horario.dia}</span>
        <span style={{
          fontSize: 11, color: C.gris400, fontFamily: '"DM Sans", sans-serif',
        }}>ID #{horario.id}</span>
      </div>

      {/* Horas */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 22 }}>🕐</span>
        <div>
          <p style={{
            margin: 0, fontSize: 18, fontWeight: 800, color: C.gris900,
            fontFamily: '"DM Sans", sans-serif', lineHeight: 1.1,
          }}>
            {horario.horaInicio} – {horario.horaFin}
          </p>
          <p style={{
            margin: '2px 0 0', fontSize: 12, color: diaInfo.color, fontWeight: 600,
            fontFamily: '"DM Sans", sans-serif',
          }}>{formatDuracion(duracion)}</p>
        </div>
      </div>

      {/* Acciones */}
      {esAdmin && (
        <div style={{
          borderTop: `1px solid ${C.gris200}`, paddingTop: 10,
          display: 'flex', gap: 6,
        }}>
          <Btn variante="secundario" small full onClick={() => onEditar(horario)}>
            ✏️ Editar
          </Btn>
          <Btn variante="peligro" small full onClick={() => onEliminar(horario)}>
            🗑️
          </Btn>
        </div>
      )}
    </div>
  );
}

// ─── Vista semanal (timeline) ──────────────────────────────────────────────
function VistaSemanal({ horarios }) {
  const HORA_MIN = 6;
  const HORA_MAX = 22;
  const TOTAL_HORAS = HORA_MAX - HORA_MIN;
  const PX_POR_HORA = 52;
  const ALTURA_TOTAL = TOTAL_HORAS * PX_POR_HORA;

  const horaAPx = (horaStr) => {
    const [h, m] = horaStr.split(':').map(Number);
    return ((h + m / 60) - HORA_MIN) * PX_POR_HORA;
  };

  const horas = Array.from({ length: TOTAL_HORAS + 1 }, (_, i) => HORA_MIN + i);

  return (
    <div style={{
      background: C.blanco, border: `1.5px solid ${C.gris200}`,
      borderRadius: 14, padding: '20px 20px 20px 64px',
      boxShadow: sombra, overflowX: 'auto',
    }}>
      <p style={{
        margin: '0 0 16px -44px', fontSize: 13, fontWeight: 700, color: C.gris600,
        textTransform: 'uppercase', letterSpacing: '0.06em',
        fontFamily: '"DM Sans", sans-serif',
      }}>Vista semanal</p>

      {/* Encabezados de días */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 4, marginBottom: 8, marginLeft: 0,
      }}>
        {DIAS.map(d => {
          const tieneHorarios = horarios.some(h => h.dia === d.nombre);
          return (
            <div key={d.num} style={{
              textAlign: 'center', padding: '4px 0',
              fontSize: 11, fontWeight: 700,
              color: tieneHorarios ? d.color : C.gris400,
              fontFamily: '"DM Sans", sans-serif',
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>{d.corto}</div>
          );
        })}
      </div>

      {/* Grid principal */}
      <div style={{ position: 'relative', display: 'flex', gap: 4 }}>

        {/* Marcas de hora */}
        <div style={{
          position: 'absolute', left: -52, top: 0,
          height: ALTURA_TOTAL, width: 44,
        }}>
          {horas.map(h => (
            <div key={h} style={{
              position: 'absolute', top: (h - HORA_MIN) * PX_POR_HORA - 7,
              fontSize: 10, color: C.gris400, fontWeight: 600,
              fontFamily: '"DM Sans", sans-serif', right: 6, textAlign: 'right',
            }}>{String(h).padStart(2,'0')}:00</div>
          ))}
        </div>

        {/* Columnas por día */}
        {DIAS.map(d => {
          const bloques = horarios.filter(h => h.dia === d.nombre);
          return (
            <div key={d.num} style={{
              flex: 1, position: 'relative',
              height: ALTURA_TOTAL, minWidth: 70,
              background: C.gris50,
              borderRadius: 8,
              border: `1px solid ${C.gris200}`,
            }}>
              {/* Líneas de hora */}
              {horas.map(h => (
                <div key={h} style={{
                  position: 'absolute', top: (h - HORA_MIN) * PX_POR_HORA,
                  left: 0, right: 0, borderTop: `1px dashed ${C.gris200}`,
                }} />
              ))}

              {/* Bloques de horario */}
              {bloques.map(horario => {
                const top    = horaAPx(horario.horaInicio);
                const height = horaAPx(horario.horaFin) - top;
                return (
                  <div key={horario.id} style={{
                    position: 'absolute', top, left: 3, right: 3, height: Math.max(height - 3, 20),
                    background: d.bg,
                    border: `1.5px solid ${d.color}40`,
                    borderLeft: `3px solid ${d.color}`,
                    borderRadius: 6,
                    padding: '3px 6px', overflow: 'hidden',
                  }}>
                    <p style={{
                      margin: 0, fontSize: 10, fontWeight: 700, color: d.color,
                      fontFamily: '"DM Sans", sans-serif', lineHeight: 1.2,
                    }}>{horario.horaInicio}</p>
                    {height > 30 && (
                      <p style={{
                        margin: 0, fontSize: 9, color: d.color,
                        fontFamily: '"DM Sans", sans-serif', opacity: 0.7,
                      }}>{horario.horaFin}</p>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{
      background: C.blanco, border: `1.5px solid ${C.gris200}`,
      borderRadius: 13, padding: '16px 18px',
    }}>
      {[60, 90, 45].map((w, i) => (
        <div key={i} style={{
          height: 13, width: `${w}%`, background: C.gris200, borderRadius: 6,
          marginBottom: 10, animation: 'pulse 1.4s ease-in-out infinite',
          animationDelay: `${i * 0.12}s`,
        }} />
      ))}
    </div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────
export default function GestionHorarios() {
  const [horarios,      setHorarios]      = useState([]);
  const [cargando,      setCargando]      = useState(true);
  const [filtroDia,     setFiltroDia]     = useState(0);   // 0 = todos
  const [vista,         setVista]         = useState('tarjetas'); // 'tarjetas' | 'semanal'
  const [modalCrear,    setModalCrear]    = useState(false);
  const [horarioEditar, setHorarioEditar] = useState(null);
  const [horarioElim,   setHorarioElim]   = useState(null);
  const [guardando,     setGuardando]     = useState(false);
  const [toast,         setToast]         = useState({ msg: '', tipo: 'info' });

  const esAdmin = ROLES_ADMIN.includes(getRolDesdeToken());
  const mostrarToast = useCallback((msg, tipo = 'info') => setToast({ msg, tipo }), []);

  const cargarHorarios = useCallback(async () => {
    setCargando(true);
    try {
      const data = await getHorarios();
      setHorarios(data);
    } catch (e) {
      mostrarToast(e.message, 'error');
    } finally { setCargando(false); }
  }, [mostrarToast]);

  useEffect(() => { cargarHorarios(); }, [cargarHorarios]);

  const horariosFiltrados = filtroDia === 0
    ? horarios
    : horarios.filter(h => {
        const diaInfo = DIAS.find(d => d.num === filtroDia);
        return h.dia === diaInfo?.nombre;
      });

  const handleCrear = async (datos) => {
    setGuardando(true);
    try {
      await crearHorario(datos);
      mostrarToast('Horario creado correctamente ✓', 'exito');
      setModalCrear(false);
      cargarHorarios();
    } catch (e) { mostrarToast(e.message, 'error'); }
    finally { setGuardando(false); }
  };

  const handleEditar = async (datos) => {
    setGuardando(true);
    try {
      await editarHorario(horarioEditar.id, datos);
      mostrarToast('Horario actualizado correctamente ✓', 'exito');
      setHorarioEditar(null);
      cargarHorarios();
    } catch (e) { mostrarToast(e.message, 'error'); }
    finally { setGuardando(false); }
  };

  const handleEliminar = async () => {
    setGuardando(true);
    try {
      await eliminarHorario(horarioElim.id);
      mostrarToast('Horario eliminado correctamente ✓', 'exito');
      setHorarioElim(null);
      cargarHorarios();
    } catch (e) { mostrarToast(e.message, 'error'); }
    finally { setGuardando(false); }
  };

  // Stats
  const totalBloques  = horarios.length;
  const diasConBloque = new Set(horarios.map(h => h.dia)).size;
  const totalMinutos  = horarios.reduce((acc, h) => acc + duracionMin(h.horaInicio, h.horaFin), 0);
  const horasTotales  = Math.round(totalMinutos / 60 * 10) / 10;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap');
        @keyframes slideUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes popIn   { from{opacity:0;transform:scale(0.96)}      to{opacity:1;transform:scale(1)}      }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.4} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.gris200}; border-radius: 99px; }
      `}</style>

      <div style={{
        minHeight: '100vh', background: C.gris100,
        fontFamily: '"DM Sans", sans-serif', padding: '32px 24px',
      }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>

          {/* ── Encabezado ── */}
          <div style={{
            display: 'flex', alignItems: 'flex-start',
            justifyContent: 'space-between', flexWrap: 'wrap',
            gap: 16, marginBottom: 28,
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10, background: C.naranja,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                }}>📅</div>
                <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: C.gris900 }}>
                  Gestión de Horarios
                </h1>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: C.gris400 }}>
                {horarios.length} bloque{horarios.length !== 1 ? 's' : ''} registrado{horarios.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {/* Toggle vista */}
              <div style={{
                display: 'flex', background: C.gris200, borderRadius: 8, padding: 3,
              }}>
                {[
                  { key: 'tarjetas', label: '⊞ Tarjetas' },
                  { key: 'semanal',  label: '📅 Semanal'  },
                ].map(v => (
                  <button key={v.key} onClick={() => setVista(v.key)} style={{
                    padding: '5px 12px', borderRadius: 6, border: 'none',
                    background: vista === v.key ? C.blanco : 'transparent',
                    color: vista === v.key ? C.gris900 : C.gris600,
                    cursor: 'pointer', fontSize: 12, fontWeight: 700,
                    fontFamily: '"DM Sans", sans-serif',
                    boxShadow: vista === v.key ? sombra : 'none',
                    transition: 'all 0.14s',
                  }}>{v.label}</button>
                ))}
              </div>

              {esAdmin && (
                <Btn variante="primario" onClick={() => setModalCrear(true)}>
                  ＋ Nuevo horario
                </Btn>
              )}
            </div>
          </div>

          {/* ── Stats ── */}
          <div style={{
            display: 'grid', gap: 12, marginBottom: 24,
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          }}>
            {[
              { icono: '📅', valor: totalBloques,  label: 'Bloques totales', color: C.naranja, bg: C.naranjaClaro },
              { icono: '📆', valor: diasConBloque, label: 'Días con bloque', color: C.azul,    bg: C.azulClaro    },
              { icono: '⏱',  valor: `${horasTotales}h`, label: 'Horas programadas', color: C.verde,   bg: C.verdeClaro   },
            ].map(({ icono, valor, label, color, bg }) => (
              <div key={label} style={{
                background: bg, border: `1.5px solid ${color}25`,
                borderRadius: 12, padding: '14px 18px',
                display: 'flex', alignItems: 'center', gap: 12,
                boxShadow: sombra,
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 9,
                  background: `${color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
                }}>{icono}</div>
                <div>
                  <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: C.gris900, fontFamily: '"DM Sans", sans-serif', lineHeight: 1 }}>{valor}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 10, color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: '"DM Sans", sans-serif' }}>{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Filtro por día ── */}
          <div style={{
            display: 'flex', gap: 6, flexWrap: 'wrap',
            marginBottom: 20, alignItems: 'center',
          }}>
            <button
              onClick={() => setFiltroDia(0)}
              style={{
                padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
                border: `1.5px solid ${filtroDia === 0 ? C.naranja : C.gris200}`,
                background: filtroDia === 0 ? C.naranjaClaro : C.blanco,
                color: filtroDia === 0 ? C.naranja : C.gris600,
                fontSize: 12, fontWeight: 700, fontFamily: '"DM Sans", sans-serif',
                transition: 'all 0.14s',
              }}
            >Todos</button>
            {DIAS.map(d => {
              const activo = filtroDia === d.num;
              const cuenta = horarios.filter(h => h.dia === d.nombre).length;
              return (
                <button key={d.num} onClick={() => setFiltroDia(activo ? 0 : d.num)} style={{
                  padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
                  border: `1.5px solid ${activo ? d.color : C.gris200}`,
                  background: activo ? d.bg : C.blanco,
                  color: activo ? d.color : C.gris600,
                  fontSize: 12, fontWeight: 700, fontFamily: '"DM Sans", sans-serif',
                  display: 'flex', alignItems: 'center', gap: 5,
                  transition: 'all 0.14s',
                }}>
                  {d.corto}
                  {cuenta > 0 && (
                    <span style={{
                      background: activo ? d.color : C.gris200,
                      color: activo ? C.blanco : C.gris600,
                      borderRadius: 10, padding: '0 5px', fontSize: 10, fontWeight: 700,
                    }}>{cuenta}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ── Contenido ── */}
          {vista === 'semanal' ? (
            <VistaSemanal horarios={horarios} />
          ) : cargando ? (
            <div style={{
              display: 'grid', gap: 14,
              gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
            }}>
              {[...Array(6)].map((_, i) => <Skeleton key={i} />)}
            </div>
          ) : horariosFiltrados.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '60px 24px',
              background: C.blanco, borderRadius: 14,
              border: `1.5px dashed ${C.gris200}`,
            }}>
              <p style={{ fontSize: 38, margin: '0 0 10px' }}>📅</p>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.gris900 }}>
                {filtroDia !== 0 ? 'Sin horarios este día' : 'No hay horarios aún'}
              </p>
              <p style={{ margin: '6px 0 0', fontSize: 13, color: C.gris400 }}>
                {esAdmin ? 'Crea el primer bloque con el botón de arriba.' : 'No hay horarios registrados.'}
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid', gap: 14,
              gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
            }}>
              {horariosFiltrados.map(h => (
                <TarjetaHorario
                  key={h.id} horario={h} esAdmin={esAdmin}
                  onEditar={setHorarioEditar}
                  onEliminar={setHorarioElim}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Modales ── */}
      {modalCrear && (
        <ModalFormHorario
          onGuardar={handleCrear}
          onCerrar={() => setModalCrear(false)}
          cargando={guardando}
        />
      )}
      {horarioEditar && (
        <ModalFormHorario
          inicial={horarioEditar}
          onGuardar={handleEditar}
          onCerrar={() => setHorarioEditar(null)}
          cargando={guardando}
        />
      )}
      {horarioElim && (
        <ModalEliminar
          horario={horarioElim}
          onConfirmar={handleEliminar}
          onCerrar={() => setHorarioElim(null)}
          cargando={guardando}
        />
      )}

      <Toast msg={toast.msg} tipo={toast.tipo} onClose={() => setToast({ msg: '', tipo: 'info' })} />
    </>
  );
}