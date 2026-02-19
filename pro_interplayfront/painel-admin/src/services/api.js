import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// controle de refresh em andamento
let isRefreshing = false;
let refreshSubscribers = [];

// adiciona callbacks enquanto refresh acontece
function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

// executa todos callbacks quando novo token chega
function onRefreshed(token) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

// =========================
// REQUEST INTERCEPTOR
// adiciona access token
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
// refresh automático seguro
// =========================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // se erro não é 401 → segue fluxo normal
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // se já é tentativa de refresh → logout
    if (originalRequest.url.includes("token/refresh")) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      window.location.href = "/";
      return Promise.reject(error);
    }

    // se não existe refresh token → logout
    const refresh = localStorage.getItem("refresh");
    if (!refresh) {
      window.location.href = "/";
      return Promise.reject(error);
    }

    // se já está fazendo refresh → espera
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

      // libera todas requisições que estavam aguardando
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
