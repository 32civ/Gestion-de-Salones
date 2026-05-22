import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import GestionSalones from '../pages/Salones/GestionSalones';
import GestionHorarios from '../pages/Horarios/GestionHorarios';
import GestionAsignaciones from "../pages/Asignaciones/GestionAsignaciones";


function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/salones" element={<GestionSalones />} />
                <Route path="/horarios" element={<GestionHorarios />} />
                <Route path="/asignaciones" element={<GestionAsignaciones />} />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;