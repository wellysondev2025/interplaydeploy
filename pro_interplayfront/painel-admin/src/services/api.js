import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

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
// refresh automático
// =========================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se deu 401 e ainda não tentou refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refresh = localStorage.getItem("refresh");

      if (!refresh) {
        // sem refresh → desloga
        window.location.href = "/";
        return Promise.reject(error);
      }

      try {
        // chama endpoint de refresh
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}token/refresh/`,
          { refresh }
        );

        const newAccess = response.data.access;

        // salva novo access
        localStorage.setItem("access", newAccess);

        // atualiza header e refaz request original
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;

        return api(originalRequest);
      } catch (refreshError) {
        // refresh expirou → logout total
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.href = ("/");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
