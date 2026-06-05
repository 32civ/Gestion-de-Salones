import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMiPerfil } from "../../api/estudiantesApi";
import { getMisMaterias } from "../../api/matriculasApi";
import { nombreDia } from '../../helpers/Dias';

function DashboardEstudiante() {
    const navigate = useNavigate();
    const [perfil, setPerfil] = useState(null);
    const [materias, setMaterias] = useState([]);
    const [loading, setLoading] = useState(true);

    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

    useEffect(() => { cargarDatos(); }, []);

    const cargarDatos = async () => {
        try {
            const [perfilData, materiasData] = await Promise.all([
                getMiPerfil(),
                getMisMaterias()
            ]);
            setPerfil(perfilData);
            setMaterias(materiasData);
        } catch (err) {
            console.error(err);
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
            icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
        },
        {
            label: "Mis materias", path: "/mis-materias-estudiante",
            icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
        },
        {
            label: "Matrícula", path: "/matricula",
            icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
        },
    ];

    if (loading) return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5" }}>
            <p style={{ color: "#888", fontSize: "14px" }}>Cargando...</p>
        </div>
    );

    const metricCards = [
        { label: "Materias matriculadas", value: perfil?.totalMateriasMatriculadas ?? 0, sub: "Este semestre", bg: "#FFF0E8", stroke: "#E8600A" },
        { label: "Carrera", value: perfil?.carrera ?? "—", sub: "Programa actual", bg: "#e8f0fe", stroke: "#1a73e8", esTexto: true },
        { label: "Cursos activos", value: materias.length, sub: "Con salón asignado", bg: "#e8f5e9", stroke: "#2e7d32" },
    ];

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
                            <p style={{ fontSize: "11px", color: "#aaa", margin: 0 }}>Estudiante</p>
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

            {/* Contenido */}
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
                            <p style={{ fontSize: card.esTexto ? "16px" : "28px", fontWeight: 500, color: "#1a1a1a", margin: "0 0 4px" }}>{card.value}</p>
                            <p style={{ fontSize: "12px", color: "#aaa", margin: 0 }}>{card.sub}</p>
                        </div>
                    ))}
                </div>

                {/* Tabla materias actuales */}
                <div style={{ background: "white", border: "0.5px solid #eee", borderRadius: "12px", padding: "1.25rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                        <h3 style={{ fontSize: "14px", fontWeight: 500, color: "#1a1a1a", margin: 0 }}>
                            📚 Mis materias este semestre
                        </h3>
                        <button onClick={() => navigate("/matricula")}
                            style={{ padding: "6px 14px", background: "#FFF0E8", color: "#E8600A", border: "1px solid #f5cba7", borderRadius: "8px", fontSize: "12px", fontWeight: 500, cursor: "pointer" }}>
                            + Matricular materia
                        </button>
                    </div>
                    <table style={{ width: "100%", fontSize: "13px", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                                {["Materia", "Docente", "Salón", "Horario"].map(col => (
                                    <th key={col} style={{ textAlign: "left", padding: "6px 8px 10px", color: "#aaa", fontWeight: 400 }}>{col}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {materias.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ padding: "2rem 0", textAlign: "center", color: "#aaa" }}>
                                        No tienes materias matriculadas aún —{" "}
                                        <span onClick={() => navigate("/matricula")} style={{ color: "#E8600A", cursor: "pointer" }}>
                                            matricúlate aquí
                                        </span>
                                    </td>
                                </tr>
                            ) : (
                                materias.map((m) => (
                                    <tr key={m.id} style={{ borderBottom: "1px solid #f9f9f9" }}>
                                        <td style={{ padding: "10px 8px", color: "#1a1a1a", fontWeight: 500 }}>{m.materia}</td>
                                        <td style={{ padding: "10px 8px", color: "#555" }}>{m.docente}</td>
                                        <td style={{ padding: "10px 8px", color: "#555" }}>{m.salonAsignado}</td>
                                        <td style={{ padding: "10px 8px", color: "#555" }}>
                                            {m.horario
                                                ? ` ${nombreDia(m.horario.dia)} ${m.horario.horaInicio} - ${m.horario.horaFin}`
                                                : <span style={{ color: "#ccc" }}>—</span>}
                                        </td>
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

export default DashboardEstudiante;