import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function DashboardDocente() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalCursos: 0,
        pendientes: 0,
        aprobadas: 0
    });
    const [asignacionesPendientes, setAsignacionesPendientes] = useState([]);
    const [asignacionesAprobadas, setAsignacionesAprobadas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [comentario, setComentario] = useState("");
    const [rechazandoId, setRechazandoId] = useState(null);

    const token = localStorage.getItem("token");
    const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
    };
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const res = await fetch("https://localhost:7138/api/Aprobaciones/mis-asignaciones", { headers });
            const data = await res.json();

            const pendientes = data.filter(a => a.estado === "Pendiente");
            const aprobadas = data.filter(a => a.estado === "Aprobado");

            setAsignacionesPendientes(pendientes);
            setAsignacionesAprobadas(aprobadas);

            setStats({
                totalCursos: aprobadas.length,
                pendientes: pendientes.length,
                aprobadas: aprobadas.length
            });
        } catch (error) {
            console.error("Error cargando datos:", error);
        } finally {
            setLoading(false);
        }
    };

    const aceptarAsignacion = async (id) => {
        try {
            await fetch(`https://localhost:7138/api/Aprobaciones/${id}/aceptar`, {
                method: "PUT",
                headers
            });
            cargarDatos();
        } catch (error) {
            console.error("Error aceptando asignación:", error);
        }
    };

    const rechazarAsignacion = async (id) => {
        if (!comentario.trim()) {
            alert("Debes ingresar un comentario para rechazar");
            return;
        }
        try {
            await fetch(`https://localhost:7138/api/Aprobaciones/${id}/rechazar?comentario=${encodeURIComponent(comentario)}`, {
                method: "PUT",
                headers
            });
            setRechazandoId(null);
            setComentario("");
            cargarDatos();
        } catch (error) {
            console.error("Error rechazando asignación:", error);
        }
    };

    const cerrarSesion = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        navigate("/");
    };

    const navItems = [
        {
            label: "Dashboard", path: "/dashboard",
            icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
        },
        {
            label: "Mis cursos", path: "/mis-cursos",
            icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
        },
        {
            label: "Mis asignaciones", path: "/mis-asignaciones",
            icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        },
    ];

    const metricCards = [
        { label: "Mis cursos", value: stats.totalCursos, sub: "Este semestre", bg: "#FFF0E8", stroke: "#E8600A" },
        { label: "Pendientes", value: stats.pendientes, sub: "Por aceptar o rechazar", bg: "#fff8e1", stroke: "#f9a825" },
        { label: "Aprobadas", value: stats.aprobadas, sub: "Asignaciones confirmadas", bg: "#e8f5e9", stroke: "#2e7d32" },
    ];

    if (loading) return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5" }}>
            <p style={{ color: "#888", fontSize: "14px" }}>Cargando...</p>
        </div>
    );

    return (
        <div style={{ minHeight: "100vh", background: "#f5f5f5", display: "flex" }}>

            {/* Sidebar */}
            <div style={{ width: "220px", background: "white", borderRight: "1px solid #eee", display: "flex", flexDirection: "column", padding: "1.5rem 0", flexShrink: 0 }}>
                <div style={{ padding: "0 1.25rem 1.5rem", borderBottom: "1px solid #eee" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "36px", height: "36px", background: "#E8600A", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5V19a1 1 0 001 1h6v-5h4v5h6a1 1 0 001-1v-8.5M9 21V12h6v9M3 10.5L12 3l9 7.5" />
                            </svg>
                        </div>
                        <div>
                            <p style={{ fontSize: "13px", fontWeight: 500, color: "#1a1a1a", margin: 0 }}>Gestión Salones</p>
                            <p style={{ fontSize: "11px", color: "#aaa", margin: 0 }}>Docente</p>
                        </div>
                    </div>
                </div>

                <nav style={{ padding: "1rem 0.75rem", flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <a key={item.path} onClick={() => navigate(item.path)}
                                style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", background: isActive ? "#FFF0E8" : "transparent", borderRadius: "8px", fontSize: "13px", color: isActive ? "#E8600A" : "#666", fontWeight: isActive ? 500 : 400, cursor: "pointer" }}>
                                {item.icon}
                                {item.label}
                            </a>
                        );
                    })}
                </nav>

                <div style={{ padding: "0.75rem", borderTop: "1px solid #eee" }}>
                    <a onClick={cerrarSesion}
                        style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", borderRadius: "8px", fontSize: "13px", color: "#e53e3e", cursor: "pointer" }}>
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Cerrar sesión
                    </a>
                </div>
            </div>

            {/* Main */}
            <div style={{ flex: 1, padding: "2rem", overflow: "auto" }}>

                {/* Header */}
                <div style={{ marginBottom: "2rem" }}>
                    <h1 style={{ fontSize: "20px", fontWeight: 500, color: "#1a1a1a", margin: "0 0 4px" }}>
                        Buenos días, {usuario?.nombre} 👋
                    </h1>
                    <p style={{ fontSize: "13px", color: "#888", margin: 0 }}>
                        {new Date().toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                    </p>
                </div>

                {/* Metric cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
                    {metricCards.map((card) => (
                        <div key={card.label} style={{ background: "white", border: "0.5px solid #eee", borderRadius: "12px", padding: "1.25rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                                <p style={{ fontSize: "12px", color: "#888", margin: 0 }}>{card.label}</p>
                                <div style={{ width: "32px", height: "32px", background: card.bg, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={card.stroke} strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <p style={{ fontSize: "28px", fontWeight: 500, color: "#1a1a1a", margin: "0 0 4px" }}>{card.value}</p>
                            <p style={{ fontSize: "12px", color: "#aaa", margin: 0 }}>{card.sub}</p>
                        </div>
                    ))}
                </div>

                {/* Asignaciones pendientes */}
                {asignacionesPendientes.length > 0 && (
                    <div style={{ background: "white", border: "0.5px solid #eee", borderRadius: "12px", padding: "1.25rem", marginBottom: "1rem" }}>
                        <h3 style={{ fontSize: "14px", fontWeight: 500, color: "#1a1a1a", margin: "0 0 1rem" }}>
                            ⚠️ Asignaciones pendientes de revisión
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {asignacionesPendientes.map((a) => (
                                <div key={a.id} style={{ border: "1px solid #fff8e1", background: "#fffdf0", borderRadius: "10px", padding: "1rem" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div>
                                            <p style={{ fontSize: "14px", fontWeight: 500, color: "#1a1a1a", margin: "0 0 4px" }}>{a.materia}</p>
                                            <p style={{ fontSize: "12px", color: "#888", margin: 0 }}>
                                                {a.salon} · Día {a.dia} {a.horaInicio} - {a.horaFin} · Capacidad: {a.capacidad}
                                            </p>
                                            {a.recursos && a.recursos.length > 0 && (
                                                <p style={{ fontSize: "12px", color: "#aaa", margin: "4px 0 0" }}>
                                                    Recursos: {a.recursos.join(", ")}
                                                </p>
                                            )}
                                        </div>
                                        <div style={{ display: "flex", gap: "8px" }}>
                                            <button onClick={() => aceptarAsignacion(a.id)}
                                                style={{ padding: "7px 14px", background: "#e8f5e9", color: "#2e7d32", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: 500, cursor: "pointer" }}>
                                                ✓ Aceptar
                                            </button>
                                            <button onClick={() => setRechazandoId(a.id)}
                                                style={{ padding: "7px 14px", background: "#ffebee", color: "#c62828", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: 500, cursor: "pointer" }}>
                                                ✗ Rechazar
                                            </button>
                                        </div>
                                    </div>

                                    {/* Input comentario para rechazar */}
                                    {rechazandoId === a.id && (
                                        <div style={{ marginTop: "1rem", display: "flex", gap: "8px" }}>
                                            <input
                                                type="text"
                                                placeholder="Motivo del rechazo..."
                                                value={comentario}
                                                onChange={(e) => setComentario(e.target.value)}
                                                style={{ flex: 1, padding: "8px 12px", fontSize: "13px", border: "1px solid #e0e0e0", borderRadius: "8px", outline: "none" }}
                                            />
                                            <button onClick={() => rechazarAsignacion(a.id)}
                                                style={{ padding: "8px 14px", background: "#c62828", color: "white", border: "none", borderRadius: "8px", fontSize: "12px", cursor: "pointer" }}>
                                                Confirmar
                                            </button>
                                            <button onClick={() => { setRechazandoId(null); setComentario(""); }}
                                                style={{ padding: "8px 14px", background: "#f5f5f5", color: "#555", border: "none", borderRadius: "8px", fontSize: "12px", cursor: "pointer" }}>
                                                Cancelar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Salones aprobados */}
                <div style={{ background: "white", border: "0.5px solid #eee", borderRadius: "12px", padding: "1.25rem" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: 500, color: "#1a1a1a", margin: "0 0 1rem" }}>
                        ✅ Mis salones confirmados
                    </h3>
                    <table style={{ width: "100%", fontSize: "13px", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                                <th style={{ textAlign: "left", padding: "6px 0", color: "#aaa", fontWeight: 400 }}>Materia</th>
                                <th style={{ textAlign: "left", padding: "6px 0", color: "#aaa", fontWeight: 400 }}>Salón</th>
                                <th style={{ textAlign: "left", padding: "6px 0", color: "#aaa", fontWeight: 400 }}>Horario</th>
                                <th style={{ textAlign: "left", padding: "6px 0", color: "#aaa", fontWeight: 400 }}>Recursos</th>
                            </tr>
                        </thead>
                        <tbody>
                            {asignacionesAprobadas.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ padding: "1rem 0", color: "#aaa", textAlign: "center" }}>
                                        No tienes salones confirmados aún
                                    </td>
                                </tr>
                            ) : (
                                asignacionesAprobadas.map((a) => (
                                    <tr key={a.id} style={{ borderBottom: "1px solid #f9f9f9" }}>
                                        <td style={{ padding: "10px 0", color: "#333" }}>{a.materia}</td>
                                        <td style={{ padding: "10px 0", color: "#555" }}>{a.salon}</td>
                                        <td style={{ padding: "10px 0", color: "#555" }}>Día {a.dia} {a.horaInicio} - {a.horaFin}</td>
                                        <td style={{ padding: "10px 0", color: "#555" }}>{a.recursos?.join(", ") || "Sin recursos"}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default DashboardDocente;