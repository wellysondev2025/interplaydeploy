import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 20000, // Render free precisa disso (20s)
});

// =========================
// controle de refresh
// =========================
let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

// =========================
// REQUEST INTERCEPTOR
// =========================
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// =========================
// RESPONSE INTERCEPTOR
// =========================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ✅ Evita loop infinito
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // 🟡 ERRO DE REDE / BACKEND DORMINDO
    if (!error.response || error.code === "ECONNABORTED" || error.message === "Network Error") {
      console.warn("Backend possivelmente dormindo... tentando novamente");
      return new Promise((resolve) =>
        setTimeout(() => resolve(api(originalRequest)), 3000)
      );
    }

    // se não é 401 → erro normal
    if (error.response.status !== 401) {
      return Promise.reject(error);
    }

    // se não tem refresh → logout
    const refresh = localStorage.getItem("refresh");
    if (!refresh) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      window.location.href = "/";
      return Promise.reject(error);
    }

    // se já existe refresh rodando, espera ele terminar
    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    // marca como retry e inicia refresh
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/token/refresh/`,
        { refresh }
      );

      const newAccess = response.data.access;
      localStorage.setItem("access", newAccess);

      // atualiza todos requests esperando refresh
      onRefreshed(newAccess);

      originalRequest.headers.Authorization = `Bearer ${newAccess}`;
      return api(originalRequest);
    } catch (refreshError) {
      console.error("Refresh token falhou:", refreshError);
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      window.location.href = "/";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;