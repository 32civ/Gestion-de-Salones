import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../api/authService";

function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const data = await login(formData);
            localStorage.setItem("token", data.token);
            localStorage.setItem("usuario", JSON.stringify(data.usuario));
            navigate("/Dashboard");
        } catch (error) {
            setError("Correo o contraseña incorrectos");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", background: "#f5f5f5" }}>

            {/* Panel izquierdo naranja */}
            <div style={{
                width: "45%",
                background: "#E8600A",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "3rem",
                gap: "1.5rem"
            }}>
                <div style={{
                    width: "80px", height: "80px",
                    background: "rgba(255,255,255,0.15)",
                    borderRadius: "16px",
                    display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5V19a1 1 0 001 1h6v-5h4v5h6a1 1 0 001-1v-8.5M9 21V12h6v9M3 10.5L12 3l9 7.5" />
                    </svg>
                </div>

                <div style={{ textAlign: "center" }}>
                    <h1 style={{ color: "white", fontSize: "22px", fontWeight: 500, margin: "0 0 8px" }}>
                        Gestión de Salones
                    </h1>
                    <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "14px", margin: 0, lineHeight: 1.6 }}>
                        Sistema de asignación y control<br />de espacios académicos
                    </p>
                </div>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.2)", width: "100%", paddingTop: "1.5rem", display: "flex", flexDirection: "column", gap: "12px" }}>
                    {["Asignación automática de salones", "Control de horarios y recursos", "Gestión de matrículas estudiantiles"].map((item) => (
                        <div key={item} style={{ display: "flex", alignItems: "center", gap: "10px", color: "rgba(255,255,255,0.85)", fontSize: "13px" }}>
                            <div style={{ width: "28px", height: "28px", background: "rgba(255,255,255,0.15)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            {item}
                        </div>
                    ))}
                </div>
            </div>

            {/* Panel derecho */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
                <div style={{ width: "100%", maxWidth: "380px" }}>
                    <h2 style={{ fontSize: "24px", fontWeight: 500, color: "#1a1a1a", margin: "0 0 6px" }}>Bienvenido</h2>
                    <p style={{ fontSize: "14px", color: "#888", margin: "0 0 2rem" }}>
                        Ingresa tus credenciales para acceder al sistema
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

                        {/* Email */}
                        <div>
                            <label style={{ fontSize: "13px", color: "#555", display: "block", marginBottom: "6px" }}>
                                Correo electrónico
                            </label>
                            <div style={{ position: "relative" }}>
                                <svg style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#aaa" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="correo@institucion.edu.co"
                                    onChange={handleChange}
                                    required
                                    style={{ width: "100%", padding: "10px 12px 10px 38px", boxSizing: "border-box", fontSize: "14px", border: "1px solid #e0e0e0", borderRadius: "8px", outline: "none" }}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label style={{ fontSize: "13px", color: "#555", display: "block", marginBottom: "6px" }}>
                                Contraseña
                            </label>
                            <div style={{ position: "relative" }}>
                                <svg style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#aaa" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="••••••••"
                                    onChange={handleChange}
                                    required
                                    style={{ width: "100%", padding: "10px 12px 10px 38px", boxSizing: "border-box", fontSize: "14px", border: "1px solid #e0e0e0", borderRadius: "8px", outline: "none" }}
                                />
                            </div>
                        </div>

                        {error && (
                            <p style={{ color: "#ef4444", fontSize: "13px", textAlign: "center", margin: 0 }}>{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: "100%", padding: "11px",
                                background: loading ? "#f0a070" : "#E8600A",
                                color: "white", border: "none",
                                borderRadius: "8px", fontSize: "15px",
                                fontWeight: 500, cursor: "pointer",
                                marginTop: "0.25rem"
                            }}
                        >
                            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
                        </button>

                        <p style={{ textAlign: "center", fontSize: "12px", color: "#aaa", margin: 0 }}>
                            ¿Problemas para acceder? Contacta a Claude
                        </p>

                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;