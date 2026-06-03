import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCursosDisponibles, matricularse } from "../../api/matriculasApi";

function Matricula() {
    const navigate = useNavigate();
    const [carrera, setCarrera] = useState("");
    const [cursos, setCursos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [matriculando, setMatriculando] = useState(null);
    const [exito, setExito] = useState(null);
    const [busqueda, setBusqueda] = useState("");

    useEffect(() => { cargarCursos(); }, []);

    const cargarCursos = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getCursosDisponibles();
            setCarrera(data.carrera);
            setCursos(data.cursos);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleMatricular = async (cursoId) => {
        setMatriculando(cursoId);
        try {
            await matricularse(cursoId);
            setExito("¡Matrícula realizada correctamente!");
            setTimeout(() => setExito(null), 3000);
            cargarCursos();
        } catch (err) {
            alert(err.message);
        } finally {
            setMatriculando(null);
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

    const cursosFiltrados = cursos.filter(c =>
        c.materia.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.docente.toLowerCase().includes(busqueda.toLowerCase())
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
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "2rem" }}>
                    <button onClick={() => navigate("/dashboard")}
                        style={{ background: "none", border: "1px solid #eee", borderRadius: "8px", padding: "6px 12px", fontSize: "13px", color: "#666", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        Volver
                    </button>
                    <div>
                        <h1 style={{ fontSize: "20px", fontWeight: 500, color: "#1a1a1a", margin: "0 0 2px" }}>Matrícula</h1>
                        <p style={{ fontSize: "13px", color: "#888", margin: 0 }}>
                            {carrera ? `Cursos disponibles — ${carrera}` : "Cargando..."}
                        </p>
                    </div>
                </div>

                {/* Toast éxito */}
                {exito && (
                    <div style={{ background: "#e8f5e9", border: "1px solid #2e7d32", borderRadius: "10px", padding: "12px 16px", marginBottom: "1.25rem", fontSize: "13px", color: "#2e7d32", fontWeight: 500 }}>
                        ✓ {exito}
                    </div>
                )}

                {loading && <p style={{ textAlign: "center", color: "#aaa", fontSize: "13px", padding: "4rem 0" }}>Cargando cursos disponibles...</p>}

                {error && (
                    <div style={{ textAlign: "center", padding: "4rem 0" }}>
                        <p style={{ color: "#e53e3e", fontSize: "13px", marginBottom: "8px" }}>{error}</p>
                        <button onClick={cargarCursos} style={{ padding: "6px 14px", background: "#FFF0E8", color: "#E8600A", border: "none", borderRadius: "8px", fontSize: "12px", cursor: "pointer" }}>Reintentar</button>
                    </div>
                )}

                {!loading && !error && (
                    <>
                        {/* Buscador */}
                        <div style={{ background: "white", border: "0.5px solid #eee", borderRadius: "12px", padding: "1rem 1.25rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "10px" }}>
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#aaa" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Buscar por materia o docente..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                style={{ flex: 1, border: "none", outline: "none", fontSize: "13px", color: "#333" }}
                            />
                            {busqueda && (
                                <button onClick={() => setBusqueda("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: "13px" }}>✕</button>
                            )}
                        </div>

                        {/* Grid de cursos */}
                        {cursosFiltrados.length === 0 ? (
                            <div style={{ background: "white", border: "0.5px dashed #eee", borderRadius: "12px", padding: "3rem", textAlign: "center" }}>
                                <p style={{ fontSize: "32px", margin: "0 0 8px" }}>📚</p>
                                <p style={{ fontSize: "15px", fontWeight: 500, color: "#1a1a1a", margin: "0 0 4px" }}>
                                    {busqueda ? "Sin resultados" : "No hay cursos disponibles"}
                                </p>
                                <p style={{ fontSize: "13px", color: "#aaa", margin: 0 }}>
                                    {busqueda ? "Prueba con otro término." : "Ya estás matriculado en todos los cursos de tu carrera."}
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
                                {cursosFiltrados.map((curso) => (
                                    <div key={curso.id} style={{ background: "white", border: "0.5px solid #eee", borderRadius: "12px", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "10px" }}>

                                        {/* Cabecera */}
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                            <div>
                                                <p style={{ fontSize: "15px", fontWeight: 500, color: "#1a1a1a", margin: "0 0 2px" }}>{curso.materia}</p>
                                                <p style={{ fontSize: "12px", color: "#888", margin: 0 }}>{curso.docente}</p>
                                            </div>
                                            {/* Badge cupo */}
                                            <span style={{
                                                padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 500, flexShrink: 0,
                                                background: curso.cupoDisponible > 5 ? "#e8f5e9" : curso.cupoDisponible > 0 ? "#fff8e1" : "#ffebee",
                                                color: curso.cupoDisponible > 5 ? "#2e7d32" : curso.cupoDisponible > 0 ? "#f9a825" : "#c62828",
                                            }}>
                                                {curso.cupoDisponible > 0 ? `${curso.cupoDisponible} cupos` : "Sin cupos"}
                                            </span>
                                        </div>

                                        {/* Info salón y horario */}
                                        {curso.asignacion ? (
                                            <div style={{ background: "#f9f9f9", borderRadius: "8px", padding: "10px 12px", fontSize: "12px", color: "#555", display: "flex", flexDirection: "column", gap: "4px" }}>
                                                <span>🏫 {curso.asignacion.salon}</span>
                                                <span>🕐 Día {curso.asignacion.dia} {curso.asignacion.horaInicio} - {curso.asignacion.horaFin}</span>
                                            </div>
                                        ) : (
                                            <div style={{ background: "#fff8e1", borderRadius: "8px", padding: "10px 12px", fontSize: "12px", color: "#f9a825" }}>
                                                ⚠️ Sin salón asignado aún
                                            </div>
                                        )}

                                        {/* Botón matricular */}
                                        <button
                                            onClick={() => handleMatricular(curso.id)}
                                            disabled={matriculando === curso.id || curso.cupoDisponible <= 0}
                                            style={{
                                                padding: "8px", borderRadius: "8px", border: "none", fontSize: "13px", fontWeight: 500, cursor: curso.cupoDisponible <= 0 ? "not-allowed" : "pointer",
                                                background: curso.cupoDisponible <= 0 ? "#f5f5f5" : "#E8600A",
                                                color: curso.cupoDisponible <= 0 ? "#aaa" : "white",
                                                marginTop: "4px"
                                            }}>
                                            {matriculando === curso.id ? "Matriculando..." : curso.cupoDisponible <= 0 ? "Sin cupos disponibles" : "Matricularme"}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default Matricula;