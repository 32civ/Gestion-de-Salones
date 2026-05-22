import api from "./axios";

export const login = async (credentials) => {
    const response = await api.post("/auth/login", credentials);

    localStorage.setItem("token", response.data.token);
    localStorage.setItem("roles", JSON.stringify(response.data.roles));

    return response.data;
};