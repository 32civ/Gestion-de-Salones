import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import DashboardAdmin from "./DashboardAdmin";
import DashboardAdministrativo from "./DashboardAdministrativo";
import DashboardDocente from "./DashboardDocente";
import DashboardEstudiante from "./Dashboardestudiante";

function Dashboard() {

    const navigate = useNavigate();

    const usuarioString =
        localStorage.getItem("usuario");

    if (!usuarioString) {
        navigate("/");
        return null;
    }

    const usuario = JSON.parse(
    localStorage.getItem("usuario"));

    console.log(usuario);

    const roles = usuario.roles || [];

    console.log(roles);

    // ADMIN
    if (roles.includes("Administrador")) {
        return <DashboardAdmin />;
    }

    // ADMINISTRATIVO
    if (roles.includes("Administrativo")) {
        return <DashboardAdministrativo />;
    }

    // DOCENTE
    if (roles.includes("Docente")) {
        return <DashboardDocente />;
    }

    //ESTUDIANTE
    if (roles.includes("Estudiante")) {
        return <DashboardEstudiante />;
    }

    

    return <h1>No tienes permisos</h1>;
}

export default Dashboard;