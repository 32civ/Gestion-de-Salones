import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMisCursos } from "../../api/cursosApi";

function MisCursos() {
    const navigate = useNavigate();
    const [cursos, setCursos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

    useEffect(() => {
        cargarCursos();
    }, []);

    const cargarCursos = async () => {
        try {
            const data = await getMisCursos();
            setCursos(data);
        } catch (err) {
            setError(err.message || "No se pudieron cargar los cursos.");
        } finally {
            setLoading(false);
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
            icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
        },
        {
            label: "Mis cursos", path: "/mis-cursos",
            icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
        },
        {
            label: "Mis asignaciones", path: "/mis-asignaciones",
            icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        },
    ];

    const estadoBadge = (estado) => {
        const estilos = {
            "Aprobado":  { bg: "#e8f5e9", color: "#2e7d32" },
            "Pendiente": { bg: "#fff8e1", color: "#f9a825" },
            "Rechazado": { bg: "#ffebee", color: "#c62828" },
            "Cancelada": { bg: "#f5f5f5", color: "#888"    },
        };
        const s = estilos[estado] ?? { bg: "#f5f5f5", color: "#888" };
        return (
            <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 500, background: s.bg, color: s.color }}>
                {estado ?? "Sin asignar"}
            </span>
        );
    };

    // ── Métricas calculadas desde los datos ──
    const totalEstudiantes = cursos
    .filter(c => c.asignacion?.estado === "Aprobado")
    .reduce((s, c) => s + (c.estudiantesMatriculados ?? 0), 0);
    const salonesConfirmados = cursos.filter(c => c.asignacion?.estado === "Aprobado").length;

    const metricCards = [
        { label: "Total cursos",        value: cursos.length,      sub: "Este semestre",             bg: "#FFF0E8", stroke: "#E8600A" },
        { label: "Estudiantes totales", value: totalEstudiantes,   sub: "Matriculados en tus cursos", bg: "#e8f0fe", stroke: "#1a73e8" },
        { label: "Salones confirmados", value: salonesConfirmados, sub: "Asignaciones aprobadas",     bg: "#e8f5e9", stroke: "#2e7d32" },
    ];

    return (
        <div style={{ minHeight: "100vh", background: "#f5f5f5", display: "flex" }}>

            {/* ── Sidebar ── */}
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

            {/* ── Contenido principal ── */}
            <div style={{ flex: 1, padding: "2rem", overflow: "auto" }}>

                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "2rem" }}>
                    <button onClick={() => navigate("/dashboard")}
                        style={{ background: "none", border: "1px solid #eee", borderRadius: "8px", padding: "6px 12px", fontSize: "13px", color: "#666", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        Volver
                    </button>
                    <div>
                        <h1 style={{ fontSize: "20px", fontWeight: 500, color: "#1a1a1a", margin: "0 0 2px" }}>Mis cursos</h1>
                        <p style={{ fontSize: "13px", color: "#888", margin: 0 }}>Cursos asignados este semestre</p>
                    </div>
                </div>

                {/* Metric cards — solo si hay datos */}
                {!loading && !error && (
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
                )}

                {/* Tabla */}
                <div style={{ background: "white", border: "0.5px solid #eee", borderRadius: "12px", padding: "1.25rem" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: 500, color: "#1a1a1a", margin: "0 0 1.25rem" }}>
                        📚 Listado de cursos
                    </h3>

                    {loading && (
                        <p style={{ textAlign: "center", color: "#aaa", fontSize: "13px", padding: "2rem 0" }}>
                            Cargando...
                        </p>
                    )}

                    {error && (
                        <div style={{ textAlign: "center", padding: "2rem 0" }}>
                            <p style={{ color: "#e53e3e", fontSize: "13px", marginBottom: "8px" }}>{error}</p>
                            <button onClick={cargarCursos}
                                style={{ padding: "6px 14px", background: "#FFF0E8", color: "#E8600A", border: "none", borderRadius: "8px", fontSize: "12px", cursor: "pointer" }}>
                                Reintentar
                            </button>
                        </div>
                    )}

                    {!loading && !error && (
                        <table style={{ width: "100%", fontSize: "13px", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                                    {["Materia", "Carrera", "Salón", "Horario", "Recursos", "Estudiantes", "Cupo máx.", "Estado"].map(col => (
                                        <th key={col} style={{ textAlign: "left", padding: "6px 8px 10px", color: "#aaa", fontWeight: 400 }}>{col}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {cursos.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" style={{ padding: "2rem 0", textAlign: "center", color: "#aaa" }}>
                                            No tienes salones aprobados este semestre
                                        </td>
                                    </tr>
                                ) : (
                                    cursos.filter(c => c.asignacion?.estado === "Aprobado").map((curso) => (
                                        <tr key={curso.id} style={{ borderBottom: "1px solid #f9f9f9" }}>
                                            <td style={{ padding: "12px 8px", color: "#1a1a1a", fontWeight: 500 }}>{curso.materia}</td>
                                            <td style={{ padding: "12px 8px", color: "#555" }}>{curso.carrera}</td>
                                            <td style={{ padding: "12px 8px", color: "#555" }}>
                                                {curso.asignacion?.salon ?? <span style={{ color: "#ccc" }}>—</span>}
                                            </td>
                                            <td style={{ padding: "12px 8px", color: "#555" }}>
                                                {curso.asignacion
                                                    ? `Día ${curso.asignacion.dia} ${curso.asignacion.horaInicio} - ${curso.asignacion.horaFin}`
                                                    : <span style={{ color: "#ccc" }}>—</span>}
                                            </td>
                                            <td style={{ padding: "12px 8px", color: "#555" }}>
                                                {curso.asignacion?.recursos?.length > 0
                                                    ? curso.asignacion.recursos.join(", ")
                                                    : <span style={{ color: "#ccc" }}>Sin recursos</span>}
                                            </td>
                                            <td style={{ padding: "12px 8px", textAlign: "center" }}>
                                                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#1a73e8", fontWeight: 500 }}>
                                                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2h5M12 12a4 4 0 100-8 4 4 0 000 8z" />
                                                    </svg>
                                                    {curso.estudiantesMatriculados}
                                                </span>
                                            </td>
                                            <td style={{ padding: "12px 8px", color: "#555", textAlign: "center" }}>{curso.cupoMaximo}</td>
                                            <td style={{ padding: "12px 8px" }}>{estadoBadge(curso.asignacion?.estado)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MisCursos;