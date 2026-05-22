import { useState, useEffect, useCallback } from 'react';
import {
  getSalones, crearSalon, editarSalon, eliminarSalon,
  getRecursos, agregarRecursoASalon, quitarRecursoDeSalon,
} from '../../api/salones/salonesApi';

// ─── Tokens de diseño ──────────────────────────────────────────────────────
const C = {
  naranja:      '#E8611A',
  naranjaOsc:   '#C4511A',
  naranjaClaro: '#FFF0E6',
  blanco:       '#FFFFFF',
  gris50:       '#FAFAF9',
  gris100:      '#F5F4F2',
  gris200:      '#E8E6E1',
  gris400:      '#B0ADA6',
  gris600:      '#6B6860',
  gris900:      '#1C1917',
  verde:        '#16A34A',
  verdeClaro:   '#DCFCE7',
  rojo:         '#DC2626',
  rojoClaro:    '#FEE2E2',
  azul:         '#2563EB',
  azulClaro:    '#DBEAFE',
  amarillo:     '#D97706',
  amarilloClaro:'#FEF3C7',
};

const sombra      = '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05)';
const sombraMedia = '0 4px 12px rgba(0,0,0,0.09), 0 2px 4px rgba(0,0,0,0.06)';
const sombraGrande= '0 12px 30px rgba(0,0,0,0.13), 0 4px 10px rgba(0,0,0,0.08)';

// ─── Helpers ───────────────────────────────────────────────────────────────
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

// ─── Toast ─────────────────────────────────────────────────────────────────
function Toast({ msg, tipo, onClose }) {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onClose, 3800);
    return () => clearTimeout(t);
  }, [msg, onClose]);
  if (!msg) return null;

  const mapa = {
    exito: { bg: C.verdeClaro,   borde: C.verde,   texto: '#15803D', icono: '✓' },
    error: { bg: C.rojoClaro,    borde: C.rojo,    texto: '#B91C1C', icono: '✕' },
    info:  { bg: C.azulClaro,    borde: C.azul,    texto: '#1D4ED8', icono: 'ℹ' },
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
function Modal({ titulo, ancho = 480, children, onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(28,25,23,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }} onClick={onClose}>
      <div style={{
        background: C.blanco, borderRadius: 16, padding: '28px 30px',
        width: '100%', maxWidth: ancho, boxShadow: sombraGrande,
        animation: 'popIn 0.18s ease', maxHeight: '90vh', overflowY: 'auto',
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

// ─── Botón primario ────────────────────────────────────────────────────────
function Btn({ children, onClick, disabled, variante = 'primario', full = false, small = false }) {
  const [hover, setHover] = useState(false);
  const estilos = {
    primario: {
      bg:     hover ? C.naranjaOsc : C.naranja,
      color:  C.blanco,
      border: 'none',
    },
    secundario: {
      bg:     hover ? C.naranjaClaro : C.blanco,
      color:  C.naranja,
      border: `1.5px solid ${C.naranja}`,
    },
    peligro: {
      bg:     hover ? '#B91C1C' : C.rojo,
      color:  C.blanco,
      border: 'none',
    },
    neutro: {
      bg:     hover ? C.gris200 : C.blanco,
      color:  C.gris600,
      border: `1.5px solid ${C.gris200}`,
    },
  };
  const e = estilos[variante];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: full ? '100%' : undefined,
        padding: small ? '6px 14px' : '9px 18px',
        borderRadius: 8, border: e.border || 'none',
        background: disabled ? C.gris200 : e.bg,
        color: disabled ? C.gris400 : e.color,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: small ? 12 : 14, fontWeight: 700,
        fontFamily: '"DM Sans", sans-serif',
        transition: 'background 0.14s, color 0.14s',
        display: 'inline-flex', alignItems: 'center', gap: 6,
      }}
    >{children}</button>
  );
}

// ─── Campo de formulario ───────────────────────────────────────────────────
function Campo({ label, tipo = 'text', value, onChange, placeholder, min, max, error }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700,
        color: C.gris600, fontFamily: '"DM Sans", sans-serif',
        textTransform: 'uppercase', letterSpacing: '0.06em',
      }}>{label}</label>
      <input
        type={tipo} value={value} placeholder={placeholder} min={min} max={max}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', padding: '10px 13px', borderRadius: 8, boxSizing: 'border-box',
          border: `1.5px solid ${error ? C.rojo : C.gris200}`,
          fontSize: 14, fontFamily: '"DM Sans", sans-serif', color: C.gris900,
          background: error ? C.rojoClaro : C.blanco, outline: 'none',
          transition: 'border-color 0.14s',
        }}
        onFocus={e => { e.target.style.borderColor = error ? C.rojo : C.naranja; }}
        onBlur={e => { e.target.style.borderColor = error ? C.rojo : C.gris200; }}
      />
      {error && <p style={{ margin: '4px 0 0', fontSize: 12, color: C.rojo }}>{error}</p>}
    </div>
  );
}

// ─── Chip recurso ──────────────────────────────────────────────────────────
function Chip({ nombre, onQuitar }) {
  const [hover, setHover] = useState(false);
  return (
    <span
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        background: hover && onQuitar ? C.rojoClaro : C.naranjaClaro,
        color: hover && onQuitar ? C.rojo : C.naranjaOsc,
        border: `1px solid ${hover && onQuitar ? '#FECACA' : '#F9C89B'}`,
        padding: '3px 10px', borderRadius: 20,
        fontSize: 12, fontWeight: 600, fontFamily: '"DM Sans", sans-serif',
        transition: 'all 0.14s',
      }}
    >
      {nombre}
      {onQuitar && (
        <button
          onClick={onQuitar}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 0, color: 'inherit', fontSize: 12, lineHeight: 1,
            display: 'flex', alignItems: 'center',
          }}
          title="Quitar recurso"
        >✕</button>
      )}
    </span>
  );
}

// ─── Modal: Crear / Editar salón ───────────────────────────────────────────
function ModalFormSalon({ inicial, onGuardar, onCerrar, cargando }) {
  const [nombre, setNombre]       = useState(inicial?.nombre || '');
  const [capacidad, setCapacidad] = useState(inicial?.capacidad || '');
  const [errores, setErrores]     = useState({});

  const validar = () => {
    const e = {};
    if (!nombre.trim())                    e.nombre    = 'El nombre es obligatorio';
    if (!capacidad || Number(capacidad) <= 0) e.capacidad = 'Debe ser mayor a 0';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  return (
    <Modal titulo={inicial ? 'Editar salón' : 'Nuevo salón'} onClose={onCerrar}>
      <Campo
        label="Nombre del salón" value={nombre} onChange={setNombre}
        placeholder="Ej: Aula 101" error={errores.nombre}
      />
      <Campo
        label="Capacidad (personas)" tipo="number" value={capacidad}
        onChange={setCapacidad} placeholder="Ej: 30" min={1} max={500}
        error={errores.capacidad}
      />
      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <Btn variante="neutro" onClick={onCerrar} full>Cancelar</Btn>
        <Btn
          variante="primario" full
          disabled={cargando}
          onClick={() => { if (validar()) onGuardar({ nombre: nombre.trim(), capacidad: Number(capacidad) }); }}
        >
          {cargando ? 'Guardando…' : inicial ? 'Guardar cambios' : 'Crear salón'}
        </Btn>
      </div>
    </Modal>
  );
}

// ─── Modal: Confirmar eliminación ──────────────────────────────────────────
function ModalEliminar({ salon, onConfirmar, onCerrar, cargando }) {
  return (
    <Modal titulo="Eliminar salón" onClose={onCerrar}>
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
          ¿Eliminar <strong>{salon.nombre}</strong>? Esta acción es irreversible.
          Fallará si el salón tiene asignaciones activas.
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

// ─── Modal: Gestión de recursos de un salón ────────────────────────────────
function ModalRecursos({ salon, todosRecursos, onCerrar, onToast, onActualizar }) {
  const [recursosActuales, setRecursosActuales] = useState(salon.recursos || []);
  const [cargando, setCargando] = useState(false);

  // Recursos que aún no tiene el salón
  const disponibles = todosRecursos.filter(
    r => !recursosActuales.includes(r.nombre)
  );

  const agregar = async (recurso) => {
    setCargando(true);
    try {
      await agregarRecursoASalon(salon.id, recurso.id);
      setRecursosActuales(prev => [...prev, recurso.nombre]);
      onToast(`Recurso "${recurso.nombre}" agregado`, 'exito');
      onActualizar();
    } catch (e) {
      onToast(e.message, 'error');
    } finally { setCargando(false); }
  };

  const quitar = async (nombreRecurso) => {
    const recurso = todosRecursos.find(r => r.nombre === nombreRecurso);
    if (!recurso) return;
    setCargando(true);
    try {
      await quitarRecursoDeSalon(salon.id, recurso.id);
      setRecursosActuales(prev => prev.filter(n => n !== nombreRecurso));
      onToast(`Recurso "${nombreRecurso}" quitado`, 'exito');
      onActualizar();
    } catch (e) {
      onToast(e.message, 'error');
    } finally { setCargando(false); }
  };

  return (
    <Modal titulo={`Recursos — ${salon.nombre}`} ancho={520} onClose={onCerrar}>

      {/* Recursos actuales */}
      <p style={{
        margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: C.gris600,
        textTransform: 'uppercase', letterSpacing: '0.06em',
        fontFamily: '"DM Sans", sans-serif',
      }}>Recursos asignados</p>

      <div style={{
        minHeight: 48, background: C.gris50, borderRadius: 10,
        border: `1.5px solid ${C.gris200}`, padding: '12px 14px',
        display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 22,
      }}>
        {recursosActuales.length === 0 ? (
          <p style={{
            margin: 0, fontSize: 13, color: C.gris400, fontStyle: 'italic',
            fontFamily: '"DM Sans", sans-serif',
          }}>Sin recursos asignados</p>
        ) : (
          recursosActuales.map(nombre => (
            <Chip
              key={nombre}
              nombre={nombre}
              onQuitar={cargando ? null : () => quitar(nombre)}
            />
          ))
        )}
      </div>

      {/* Recursos disponibles para agregar */}
      <p style={{
        margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: C.gris600,
        textTransform: 'uppercase', letterSpacing: '0.06em',
        fontFamily: '"DM Sans", sans-serif',
      }}>Agregar recurso</p>

      {disponibles.length === 0 ? (
        <div style={{
          background: C.verdeClaro, border: `1px solid #BBF7D0`,
          borderRadius: 10, padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span>✅</span>
          <p style={{
            margin: 0, fontSize: 13, color: '#15803D',
            fontFamily: '"DM Sans", sans-serif',
          }}>El salón ya tiene todos los recursos disponibles.</p>
        </div>
      ) : (
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 6,
          maxHeight: 220, overflowY: 'auto',
        }}>
          {disponibles.map(recurso => (
            <div key={recurso.id} style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
              background: C.gris50, border: `1.5px solid ${C.gris200}`,
              borderRadius: 9, padding: '10px 14px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>🔧</span>
                <span style={{
                  fontSize: 14, fontWeight: 600, color: C.gris900,
                  fontFamily: '"DM Sans", sans-serif',
                }}>{recurso.nombre}</span>
              </div>
              <Btn
                variante="secundario" small
                disabled={cargando}
                onClick={() => agregar(recurso)}
              >
                + Agregar
              </Btn>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <Btn variante="neutro" onClick={onCerrar} full>Cerrar</Btn>
      </div>
    </Modal>
  );
}

// ─── Modal: Detalle de salón (vista lectura) ───────────────────────────────
function ModalDetalle({ salon, onCerrar, onEditar, onRecursos, esAdmin }) {
  return (
    <Modal titulo="Detalle del salón" ancho={440} onClose={onCerrar}>
      {/* Cabecera */}
      <div style={{
        background: `linear-gradient(135deg, ${C.naranja}, ${C.naranjaOsc})`,
        borderRadius: 12, padding: '20px 22px', marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{
          width: 50, height: 50, borderRadius: 12,
          background: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24,
        }}>🏫</div>
        <div>
          <p style={{
            margin: 0, fontSize: 20, fontWeight: 800,
            color: C.blanco, fontFamily: '"DM Sans", sans-serif',
          }}>{salon.nombre}</p>
          <p style={{
            margin: '2px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.75)',
            fontFamily: '"DM Sans", sans-serif',
          }}>ID #{salon.id}</p>
        </div>
      </div>

      {/* Stat capacidad */}
      <div style={{
        display: 'flex', gap: 12, marginBottom: 20,
      }}>
        {[
          { label: 'Capacidad', valor: `${salon.capacidad} personas`, icono: '👥', color: C.azul, bg: C.azulClaro },
          { label: 'Recursos', valor: `${(salon.recursos || []).length} asignados`, icono: '🔧', color: C.verde, bg: C.verdeClaro },
        ].map(({ label, valor, icono, color, bg }) => (
          <div key={label} style={{
            flex: 1, background: bg, border: `1.5px solid ${color}25`,
            borderRadius: 10, padding: '12px 14px',
          }}>
            <p style={{ margin: '0 0 2px', fontSize: 11, color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: '"DM Sans", sans-serif' }}>{icono} {label}</p>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: C.gris900, fontFamily: '"DM Sans", sans-serif' }}>{valor}</p>
          </div>
        ))}
      </div>

      {/* Recursos */}
      <p style={{
        margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: C.gris600,
        textTransform: 'uppercase', letterSpacing: '0.06em',
        fontFamily: '"DM Sans", sans-serif',
      }}>Recursos del salón</p>
      <div style={{
        background: C.gris50, borderRadius: 10,
        border: `1.5px solid ${C.gris200}`, padding: '12px 14px',
        display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 22,
      }}>
        {(salon.recursos || []).length === 0 ? (
          <p style={{ margin: 0, fontSize: 13, color: C.gris400, fontStyle: 'italic', fontFamily: '"DM Sans", sans-serif' }}>
            Sin recursos asignados
          </p>
        ) : (
          (salon.recursos || []).map(r => <Chip key={r} nombre={r} />)
        )}
      </div>

      {/* Acciones */}
      {esAdmin && (
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variante="neutro" onClick={onCerrar} full>Cerrar</Btn>
          <Btn variante="secundario" onClick={() => { onCerrar(); onRecursos(salon); }} full>
            🔧 Recursos
          </Btn>
          <Btn variante="primario" onClick={() => { onCerrar(); onEditar(salon); }} full>
            ✏️ Editar
          </Btn>
        </div>
      )}
      {!esAdmin && <Btn variante="neutro" onClick={onCerrar} full>Cerrar</Btn>}
    </Modal>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{
      background: C.blanco, border: `1.5px solid ${C.gris200}`,
      borderRadius: 14, padding: '20px 22px',
    }}>
      {[75, 55, 40, 90].map((w, i) => (
        <div key={i} style={{
          height: 13, width: `${w}%`, background: C.gris200, borderRadius: 6,
          marginBottom: 12, animation: 'pulse 1.4s ease-in-out infinite',
          animationDelay: `${i * 0.12}s`,
        }} />
      ))}
    </div>
  );
}

// ─── Tarjeta salón ─────────────────────────────────────────────────────────
function TarjetaSalon({ salon, onVer, onEditar, onEliminar, onRecursos, esAdmin }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: C.blanco,
        border: `1.5px solid ${hover ? C.naranja : C.gris200}`,
        borderRadius: 14, padding: '18px 20px',
        boxShadow: hover ? sombraMedia : sombra,
        transform: hover ? 'translateY(-2px)' : 'none',
        transition: 'all 0.18s ease',
        display: 'flex', flexDirection: 'column', gap: 12,
        cursor: 'default',
      }}
    >
      {/* Fila superior */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: C.naranjaClaro, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>🏫</div>
          <div>
            <p style={{
              margin: 0, fontSize: 15, fontWeight: 700,
              color: C.gris900, fontFamily: '"DM Sans", sans-serif',
            }}>{salon.nombre}</p>
            <p style={{
              margin: 0, fontSize: 11, color: C.gris400,
              fontFamily: '"DM Sans", sans-serif',
            }}>ID #{salon.id}</p>
          </div>
        </div>

        <span style={{
          background: C.azulClaro, color: C.azul,
          border: `1px solid ${C.azul}20`,
          padding: '3px 10px', borderRadius: 20, flexShrink: 0,
          fontSize: 12, fontWeight: 700, fontFamily: '"DM Sans", sans-serif',
        }}>
          👥 {salon.capacidad}
        </span>
      </div>

      {/* Recursos */}
      <div style={{ minHeight: 26 }}>
        {(salon.recursos || []).length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {salon.recursos.slice(0, 3).map((r, i) => <Chip key={i} nombre={r} />)}
            {salon.recursos.length > 3 && (
              <span style={{
                fontSize: 11, color: C.gris400, fontStyle: 'italic',
                alignSelf: 'center', fontFamily: '"DM Sans", sans-serif',
              }}>+{salon.recursos.length - 3} más</span>
            )}
          </div>
        ) : (
          <p style={{
            margin: 0, fontSize: 12, color: C.gris400, fontStyle: 'italic',
            fontFamily: '"DM Sans", sans-serif',
          }}>Sin recursos</p>
        )}
      </div>

      {/* Acciones */}
      <div style={{
        borderTop: `1px solid ${C.gris200}`, paddingTop: 12,
        display: 'flex', gap: 6,
      }}>
        <Btn variante="neutro" small onClick={() => onVer(salon)}>👁 Ver</Btn>
        {esAdmin && (
          <>
            <Btn variante="secundario" small onClick={() => onRecursos(salon)}>🔧</Btn>
            <Btn variante="secundario" small onClick={() => onEditar(salon)}>✏️</Btn>
            <Btn variante="peligro"    small onClick={() => onEliminar(salon)}>🗑️</Btn>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Stat card ─────────────────────────────────────────────────────────────
function StatCard({ icono, valor, label, color, bg }) {
  return (
    <div style={{
      background: bg, border: `1.5px solid ${color}25`,
      borderRadius: 12, padding: '14px 18px',
      display: 'flex', alignItems: 'center', gap: 12,
      boxShadow: sombra,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: `${color}20`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
      }}>{icono}</div>
      <div>
        <p style={{
          margin: 0, fontSize: 22, fontWeight: 800,
          color: C.gris900, fontFamily: '"DM Sans", sans-serif', lineHeight: 1,
        }}>{valor}</p>
        <p style={{
          margin: '2px 0 0', fontSize: 11, color, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.06em',
          fontFamily: '"DM Sans", sans-serif',
        }}>{label}</p>
      </div>
    </div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────
export default function GestionSalones() {
  const [salones,       setSalones]       = useState([]);
  const [todosRecursos, setTodosRecursos] = useState([]);
  const [cargando,      setCargando]      = useState(true);
  const [busqueda,      setBusqueda]      = useState('');
  const [filtroMin,     setFiltroMin]     = useState('');
  const [filtroMax,     setFiltroMax]     = useState('');

  // Modales activos
  const [modalCrear,    setModalCrear]    = useState(false);
  const [salonVer,      setSalonVer]      = useState(null);
  const [salonEditar,   setSalonEditar]   = useState(null);
  const [salonEliminar, setSalonEliminar] = useState(null);
  const [salonRecursos, setSalonRecursos] = useState(null);

  const [guardando, setGuardando] = useState(false);
  const [toast,     setToast]     = useState({ msg: '', tipo: 'info' });

  const esAdmin = ['Administrativo', 'Administrador'].includes(getRolDesdeToken());

  const mostrarToast = useCallback((msg, tipo = 'info') => setToast({ msg, tipo }), []);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const [dataSalones, dataRecursos] = await Promise.all([getSalones(), getRecursos()]);
      setSalones(dataSalones);
      setTodosRecursos(dataRecursos);
    } catch (e) {
      mostrarToast(e.message, 'error');
    } finally {
      setCargando(false);
    }
  }, [mostrarToast]);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  // ── Filtrado ──
  const salonesFiltrados = salones.filter(s => {
    const coincideNombre = s.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideMin    = filtroMin === '' || s.capacidad >= Number(filtroMin);
    const coincideMax    = filtroMax === '' || s.capacidad <= Number(filtroMax);
    return coincideNombre && coincideMin && coincideMax;
  });

  // ── CRUD handlers ──
  const handleCrear = async (datos) => {
    setGuardando(true);
    try {
      await crearSalon(datos);
      mostrarToast('Salón creado correctamente ✓', 'exito');
      setModalCrear(false);
      cargarDatos();
    } catch (e) { mostrarToast(e.message, 'error'); }
    finally { setGuardando(false); }
  };

  const handleEditar = async (datos) => {
    setGuardando(true);
    try {
      await editarSalon(salonEditar.id, datos);
      mostrarToast('Salón actualizado correctamente ✓', 'exito');
      setSalonEditar(null);
      cargarDatos();
    } catch (e) { mostrarToast(e.message, 'error'); }
    finally { setGuardando(false); }
  };

  const handleEliminar = async () => {
    setGuardando(true);
    try {
      await eliminarSalon(salonEliminar.id);
      mostrarToast('Salón eliminado correctamente ✓', 'exito');
      setSalonEliminar(null);
      cargarDatos();
    } catch (e) { mostrarToast(e.message, 'error'); }
    finally { setGuardando(false); }
  };

  // ── Stats ──
  const totalCap    = salones.reduce((a, s) => a + s.capacidad, 0);
  const capPromedio = salones.length ? Math.round(totalCap / salones.length) : 0;
  const capMax      = salones.length ? Math.max(...salones.map(s => s.capacidad)) : 0;
  const conRecursos = salones.filter(s => (s.recursos || []).length > 0).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&display=swap');
        @keyframes slideUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes popIn   { from{opacity:0;transform:scale(0.96)}      to{opacity:1;transform:scale(1)}      }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.4} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
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
                  width: 38, height: 38, borderRadius: 10,
                  background: C.naranja,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                }}>🏫</div>
                <h1 style={{
                  margin: 0, fontSize: 26, fontWeight: 800, color: C.gris900,
                }}>Gestión de Salones</h1>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: C.gris400 }}>
                {salones.length} salón{salones.length !== 1 ? 'es' : ''} en total
              </p>
            </div>

            {esAdmin && (
              <Btn variante="primario" onClick={() => setModalCrear(true)}>
                ＋ Nuevo salón
              </Btn>
            )}
          </div>

          {/* ── Stats ── */}
          <div style={{
            display: 'grid', gap: 12, marginBottom: 24,
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          }}>
            <StatCard icono="🏫" valor={salones.length}   label="Total salones"    color={C.naranja} bg={C.naranjaClaro} />
            <StatCard icono="👥" valor={capPromedio}       label="Cap. promedio"    color={C.azul}    bg={C.azulClaro}    />
            <StatCard icono="📊" valor={capMax}            label="Cap. máxima"      color={C.verde}   bg={C.verdeClaro}   />
            <StatCard icono="🔧" valor={conRecursos}       label="Con recursos"     color={C.amarillo} bg={C.amarilloClaro} />
          </div>

          {/* ── Filtros ── */}
          <div style={{
            background: C.blanco, border: `1.5px solid ${C.gris200}`,
            borderRadius: 12, padding: '14px 18px', marginBottom: 20,
            display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center',
            boxShadow: sombra,
          }}>
            {/* Búsqueda por nombre */}
            <div style={{ position: 'relative', flex: '1 1 220px' }}>
              <span style={{
                position: 'absolute', left: 11, top: '50%',
                transform: 'translateY(-50%)', color: C.gris400, fontSize: 14,
              }}>🔍</span>
              <input
                type="text"
                placeholder="Buscar por nombre…"
                value={busqueda}
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

            {/* Filtro capacidad mín */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <label style={{ fontSize: 12, color: C.gris600, fontWeight: 600, whiteSpace: 'nowrap' }}>
                Cap. mín
              </label>
              <input
                type="number" value={filtroMin} min={0}
                onChange={e => setFiltroMin(e.target.value)}
                placeholder="0"
                style={{
                  width: 72, padding: '9px 10px', borderRadius: 8,
                  border: `1.5px solid ${C.gris200}`, fontSize: 13,
                  color: C.gris900, fontFamily: '"DM Sans", sans-serif',
                  background: C.gris50, outline: 'none',
                }}
                onFocus={e => { e.target.style.borderColor = C.naranja; }}
                onBlur={e => { e.target.style.borderColor = C.gris200; }}
              />
            </div>

            {/* Filtro capacidad máx */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <label style={{ fontSize: 12, color: C.gris600, fontWeight: 600, whiteSpace: 'nowrap' }}>
                Cap. máx
              </label>
              <input
                type="number" value={filtroMax} min={0}
                onChange={e => setFiltroMax(e.target.value)}
                placeholder="∞"
                style={{
                  width: 72, padding: '9px 10px', borderRadius: 8,
                  border: `1.5px solid ${C.gris200}`, fontSize: 13,
                  color: C.gris900, fontFamily: '"DM Sans", sans-serif',
                  background: C.gris50, outline: 'none',
                }}
                onFocus={e => { e.target.style.borderColor = C.naranja; }}
                onBlur={e => { e.target.style.borderColor = C.gris200; }}
              />
            </div>

            {/* Limpiar filtros */}
            {(busqueda || filtroMin || filtroMax) && (
              <Btn
                variante="neutro" small
                onClick={() => { setBusqueda(''); setFiltroMin(''); setFiltroMax(''); }}
              >
                ✕ Limpiar
              </Btn>
            )}

            <span style={{
              marginLeft: 'auto', fontSize: 12, color: C.gris400,
              fontFamily: '"DM Sans", sans-serif',
            }}>
              {salonesFiltrados.length} resultado{salonesFiltrados.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* ── Grid de tarjetas ── */}
          {cargando ? (
            <div style={{
              display: 'grid', gap: 16,
              gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
            }}>
              {[...Array(6)].map((_, i) => <Skeleton key={i} />)}
            </div>
          ) : salonesFiltrados.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '60px 24px',
              background: C.blanco, borderRadius: 14,
              border: `1.5px dashed ${C.gris200}`,
            }}>
              <p style={{ fontSize: 38, margin: '0 0 10px' }}>🏫</p>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.gris900 }}>
                {busqueda || filtroMin || filtroMax ? 'Sin resultados' : 'No hay salones aún'}
              </p>
              <p style={{ margin: '6px 0 0', fontSize: 13, color: C.gris400 }}>
                {busqueda || filtroMin || filtroMax
                  ? 'Prueba con otros filtros.'
                  : esAdmin ? 'Crea el primer salón con el botón de arriba.' : 'No hay salones registrados.'}
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid', gap: 16,
              gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
            }}>
              {salonesFiltrados.map(salon => (
                <TarjetaSalon
                  key={salon.id}
                  salon={salon}
                  esAdmin={esAdmin}
                  onVer={setSalonVer}
                  onEditar={setSalonEditar}
                  onEliminar={setSalonEliminar}
                  onRecursos={setSalonRecursos}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Modales ── */}
      {modalCrear && (
        <ModalFormSalon
          onGuardar={handleCrear}
          onCerrar={() => setModalCrear(false)}
          cargando={guardando}
        />
      )}

      {salonEditar && (
        <ModalFormSalon
          inicial={salonEditar}
          onGuardar={handleEditar}
          onCerrar={() => setSalonEditar(null)}
          cargando={guardando}
        />
      )}

      {salonEliminar && (
        <ModalEliminar
          salon={salonEliminar}
          onConfirmar={handleEliminar}
          onCerrar={() => setSalonEliminar(null)}
          cargando={guardando}
        />
      )}

      {salonVer && (
        <ModalDetalle
          salon={salonVer}
          esAdmin={esAdmin}
          onCerrar={() => setSalonVer(null)}
          onEditar={setSalonEditar}
          onRecursos={setSalonRecursos}
        />
      )}

      {salonRecursos && (
        <ModalRecursos
          salon={salonRecursos}
          todosRecursos={todosRecursos}
          onCerrar={() => setSalonRecursos(null)}
          onToast={mostrarToast}
          onActualizar={cargarDatos}
        />
      )}

      <Toast
        msg={toast.msg}
        tipo={toast.tipo}
        onClose={() => setToast({ msg: '', tipo: 'info' })}
      />
    </>
  );
}