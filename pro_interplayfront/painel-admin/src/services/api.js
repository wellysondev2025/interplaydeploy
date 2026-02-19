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

    // 🟡 ERRO DE REDE / BACKEND DORMINDO
    if (
      error.code === "ECONNABORTED" ||
      error.message === "Network Error" ||
      !error.response
    ) {
      console.warn("Backend possivelmente dormindo... tentando novamente");

      // tenta novamente UMA vez
      return new Promise((resolve) =>
        setTimeout(() => resolve(api(originalRequest)), 3000)
      );
    }

    // se erro não é 401 → segue fluxo normal
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // se já é refresh e falhou → logout
    if (originalRequest.url.includes("token/refresh")) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      window.location.href = "/";
      return Promise.reject(error);
    }

    const refresh = localStorage.getItem("refresh");
    if (!refresh) {
      window.location.href = "/";
      return Promise.reject(error);
    }

    // já existe refresh rodando
    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}token/refresh/`,
        { refresh }
      );

      const newAccess = response.data.access;

      localStorage.setItem("access", newAccess);

      onRefreshed(newAccess);

      originalRequest.headers.Authorization = `Bearer ${newAccess}`;

      return api(originalRequest);
    } catch (refreshError) {
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
