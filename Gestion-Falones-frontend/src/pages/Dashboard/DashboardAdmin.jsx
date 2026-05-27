import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalSalones: 0,
        totalAsignaciones: 0,
        pendientes: 0,
        conflictos: 0
    });
    const [asignaciones, setAsignaciones] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const [salonesRes, asignacionesRes, conflictosRes] = await Promise.all([
                fetch("https://localhost:7138/api/salones", { headers }),
                fetch("https://localhost:7138/api/asignaciones", { headers }),
                fetch("https://localhost:7138/api/asignaciones/conflictos", { headers })
            ]);

            const salones = await salonesRes.json();
            const asignacionesData = await asignacionesRes.json();
            const conflictos = await conflictosRes.json();

            const pendientes = asignacionesData.filter(a => a.estado === "Pendiente").length;

            setStats({
                totalSalones: salones.length,
                totalAsignaciones: asignacionesData.length,
                pendientes,
                conflictos: Array.isArray(conflictos) ? conflictos.length : 0
            });

            setAsignaciones(asignacionesData.slice(0, 5));
        } catch (error) {
            console.error("Error cargando datos:", error);
        } finally {
            setLoading(false);
        }
    };

    const cerrarSesion = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        navigate("/");
    };

    const getEstadoBadge = (estado) => {
        const estilos = {
            Aprobado: { background: "#e8f5e9", color: "#2e7d32" },
            Pendiente: { background: "#fff8e1", color: "#f9a825" },
            Rechazado: { background: "#ffebee", color: "#c62828" },
            Cancelada: { background: "#f5f5f5", color: "#888" }
        };
        return estilos[estado] || estilos.Cancelada;
    };

    const navItems = [
        {
            label: "Dashboard", path: "/dashboard",
            icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
        },
        {
            label: "Salones", path: "/salones",
            icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5V19a1 1 0 001 1h6v-5h4v5h6a1 1 0 001-1v-8.5M9 21V12h6v9M3 10.5L12 3l9 7.5"/></svg>
        },
        {
            label: "Horarios", path: "/horarios",
            icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
        },
        {
            label: "Asignaciones", path: "/asignaciones",
            icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
        },
        {
            label: "Carreras y Cursos", path: "/admin/carreras-cursos",
            icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
        },
    ];

    const metricCards = [
        { label: "Total salones", value: stats.totalSalones, sub: "Registrados en el sistema", bg: "#FFF0E8", stroke: "#E8600A" },
        { label: "Asignaciones", value: stats.totalAsignaciones, sub: "Total creadas", bg: "#e8f5e9", stroke: "#2e7d32" },
        { label: "Pendientes", value: stats.pendientes, sub: "Esperando docentes", bg: "#fff8e1", stroke: "#f9a825" },
        { label: "Conflictos", value: stats.conflictos, sub: "De horario activos", bg: "#ffebee", stroke: "#c62828" },
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
                            <p style={{ fontSize: "11px", color: "#aaa", margin: 0 }}>Admin Académico</p>
                        </div>
                    </div>
                </div>

                <nav style={{ padding: "1rem 0.75rem", flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <a key={item.path} onClick={() => navigate(item.path)}
                                style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", background: isActive ? "#FFF0E8" : "transparent", borderRadius: "8px", fontSize: "13px", color: isActive ? "#E8600A" : "#666", fontWeight: isActive ? 500 : 400, cursor: "pointer", textDecoration: "none" }}>
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                    <div>
                        <h1 style={{ fontSize: "20px", fontWeight: 500, color: "#1a1a1a", margin: "0 0 4px" }}>
                            Buenos días, {usuario?.nombre} 👋
                        </h1>
                        <p style={{ fontSize: "13px", color: "#888", margin: 0 }}>
                            {new Date().toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                        </p>
                    </div>
                    <button onClick={() => navigate("/asignaciones")}
                        style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 16px", background: "#E8600A", color: "white", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Nueva asignación
                    </button>
                </div>

                {/* Metric cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
                    {metricCards.map((card) => (
                        <div key={card.label} style={{ background: "white", border: "0.5px solid #eee", borderRadius: "12px", padding: "1.25rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                                <p style={{ fontSize: "12px", color: "#888", margin: 0 }}>{card.label}</p>
                                <div style={{ width: "32px", height: "32px", background: card.bg, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={card.stroke} strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5V19a1 1 0 001 1h6v-5h4v5h6a1 1 0 001-1v-8.5M9 21V12h6v9M3 10.5L12 3l9 7.5" />
                                    </svg>
                                </div>
                            </div>
                            <p style={{ fontSize: "28px", fontWeight: 500, color: "#1a1a1a", margin: "0 0 4px" }}>{card.value}</p>
                            <p style={{ fontSize: "12px", color: "#aaa", margin: 0 }}>{card.sub}</p>
                        </div>
                    ))}
                </div>

                {/* Bottom */}
                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "1rem" }}>

                    {/* Asignaciones recientes */}
                    <div style={{ background: "white", border: "0.5px solid #eee", borderRadius: "12px", padding: "1.25rem" }}>
                        <h3 style={{ fontSize: "14px", fontWeight: 500, color: "#1a1a1a", margin: "0 0 1rem" }}>Asignaciones recientes</h3>
                        <table style={{ width: "100%", fontSize: "13px", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                                    <th style={{ textAlign: "left", padding: "6px 0", color: "#aaa", fontWeight: 400 }}>Curso</th>
                                    <th style={{ textAlign: "left", padding: "6px 0", color: "#aaa", fontWeight: 400 }}>Salón</th>
                                    <th style={{ textAlign: "left", padding: "6px 0", color: "#aaa", fontWeight: 400 }}>Horario</th>
                                    <th style={{ textAlign: "left", padding: "6px 0", color: "#aaa", fontWeight: 400 }}>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {asignaciones.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={{ padding: "1rem 0", color: "#aaa", textAlign: "center" }}>
                                            No hay asignaciones aún
                                        </td>
                                    </tr>
                                ) : (
                                    asignaciones.map((a) => (
                                        <tr key={a.id} style={{ borderBottom: "1px solid #f9f9f9" }}>
                                            <td style={{ padding: "10px 0", color: "#333" }}>{a.curso}</td>
                                            <td style={{ padding: "10px 0", color: "#555" }}>{a.salon}</td>
                                            <td style={{ padding: "10px 0", color: "#555" }}>Día {a.dia} {a.horaInicio}</td>
                                            <td style={{ padding: "10px 0" }}>
                                                <span style={{ ...getEstadoBadge(a.estado), fontSize: "11px", padding: "3px 8px", borderRadius: "20px" }}>
                                                    {a.estado}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Accesos rápidos */}
                    <div style={{ background: "white", border: "0.5px solid #eee", borderRadius: "12px", padding: "1.25rem" }}>
                        <h3 style={{ fontSize: "14px", fontWeight: 500, color: "#1a1a1a", margin: "0 0 1rem" }}>Accesos rápidos</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {[
                                { label: "Nueva asignación automática", path: "/asignaciones/nueva", primary: true },
                                { label: "Ver salones disponibles", path: "/salones" },
                                { label: "Crear nuevo salón", path: "/salones/nuevo" },
                                { label: "Gestionar horarios", path: "/horarios" },
                            ].map((item) => (
                                <button key={item.path} onClick={() => navigate(item.path)}
                                    style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", background: item.primary ? "#FFF0E8" : "#f5f5f5", border: "none", borderRadius: "8px", fontSize: "13px", color: item.primary ? "#E8600A" : "#555", fontWeight: item.primary ? 500 : 400, cursor: "pointer", textAlign: "left" }}>
                                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Dashboard;