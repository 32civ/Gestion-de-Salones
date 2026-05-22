import api from "./axios";

export const obtenerSalones = async () => {
    const response = await api.get("/salones");
    return response.data;
};