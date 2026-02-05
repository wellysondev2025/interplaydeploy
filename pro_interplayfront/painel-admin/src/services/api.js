import axios from "axios";

// Usa variável de ambiente para o baseURL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Adiciona token automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
